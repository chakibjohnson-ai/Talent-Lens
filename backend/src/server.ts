/**
 * server.ts — TalentLens CV-analyse webhook server
 *
 * Flow:
 *   1. Supabase Database Webhook POST → /webhook/cv-job
 *   2. Webhook-secret header validatie
 *   3. Job status → 'processing'
 *   4. Download CV van Supabase Storage (admin client)
 *   5. Parseer tekst uit PDF (pdf-parse) of DOCX (mammoth)
 *   6. Stuur tekst naar Claude Haiku voor structurele analyse
 *   7. Sla resultaat op in cv_analysis_jobs → Realtime triggert de frontend
 */

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// ─── Omgevingsvariabelen valideren ────────────────────────────────────────────

const SUPABASE_URL          = process.env.SUPABASE_URL          ?? '';
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ANTHROPIC_API_KEY     = process.env.ANTHROPIC_API_KEY     ?? '';
const WEBHOOK_SECRET        = process.env.WEBHOOK_SECRET        ?? '';
const PORT                  = parseInt(process.env.PORT ?? '3001', 10);

for (const [key, val] of Object.entries({ SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY, WEBHOOK_SECRET })) {
  if (!val) {
    console.error(`[server] Ontbrekende omgevingsvariabele: ${key}. Zie .env.example.`);
    process.exit(1);
  }
}

// ─── Supabase admin client (service role — geen RLS) ─────────────────────────

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface CvAnalysisResult {
  korte_samenvatting: string | null;
  werkervaring_jaren: number | null;
  opleidingen: string[];
  talen: string[];
  hard_skills: string[];
  soft_skills: string[];
}

/** Payload die Supabase Database Webhooks sturen bij een INSERT event */
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: {
    id: string;
    user_id: string;
    file_path: string;
    file_name: string;
    status: string;
  };
  old_record: null | Record<string, unknown>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Schrijft een fout naar cv_analysis_jobs en logt het lokaal. */
async function failJob(jobId: string, message: string): Promise<void> {
  console.error(`[job:${jobId}] FOUT:`, message);
  const { error: dbErr } = await supabaseAdmin
    .from('cv_analysis_jobs')
    .update({ status: 'error', error_message: message })
    .eq('id', jobId);
  if (dbErr) console.error(`[job:${jobId}] Kon fout niet opslaan in DB:`, dbErr);
}

/**
 * Downloadt een bestand vanuit de 'resumes' bucket als Buffer.
 * Gooit bij een Supabase Storage fout.
 */
async function downloadFile(filePath: string): Promise<Buffer> {
  const { data, error } = await supabaseAdmin.storage
    .from('resumes')
    .download(filePath);

  if (error || !data) {
    throw new Error(`Storage download mislukt voor "${filePath}": ${error?.message ?? 'geen data'}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Extraheert platte tekst uit een PDF- of DOCX-buffer.
 * Gooit als het bestandstype niet herkend wordt of parsing mislukt.
 */
async function extractText(buffer: Buffer, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();

  if (lower.endsWith('.pdf')) {
    const result = await pdfParse(buffer);
    const text = result.text?.trim() ?? '';
    if (text.length < 50) {
      throw new Error(
        `PDF "${fileName}" bevat te weinig leesbare tekst (mogelijk gescand). ` +
        `Gebruik een tekst-PDF of converteer naar DOCX.`,
      );
    }
    return text;
  }

  if (lower.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim() ?? '';
    if (text.length < 50) {
      throw new Error(`DOCX "${fileName}" bevat te weinig tekst.`);
    }
    return text;
  }

  throw new Error(`Niet-ondersteund bestandsformaat: "${fileName}". Gebruik PDF of DOCX.`);
}

/** Pre-processing: reduce whitespace voor kostenbesparing bij de API-call. */
function cleanText(raw: string): string {
  return raw
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\S\n]*\n[^\S\n]*/g, '\n')
    .replace(/[^\x20-\x7E\n\r\u00C0-\u024F]/g, ' ')
    .replace(/ +/g, ' ')
    .trim();
}

const CV_SYSTEM_PROMPT = `Je bent een CV-analist. Analyseer de CV-tekst en retourneer UITSLUITEND een geldig JSON-object, zonder markdown-formatting, backticks of extra tekst.

Schema (gebruik exact dit formaat):
{"korte_samenvatting":"string","werkervaring_jaren":number,"opleidingen":["string"],"talen":["string"],"hard_skills":["string"],"soft_skills":["string"]}

Regels:
- korte_samenvatting: max 2 zinnen in het Nederlands
- werkervaring_jaren: totale jaren werkervaring als getal (referentiejaar 2026), ontbreekt = null
- opleidingen: volledige opleiding/diploma namen
- talen: gesproken of geschreven talen
- hard_skills: technische vaardigheden, tools, certificaten, software
- soft_skills: interpersoonlijke en persoonlijke vaardigheden
- Lege arrays als [], ontbrekende waarden als null
- Retourneer ALLEEN de JSON, geen uitleg`;

/**
 * Stuurt de CV-tekst naar Claude Haiku en parseert de JSON-response.
 * Gooit bij een API-fout of ongeldige JSON.
 */
async function analyseWithClaude(cvText: string): Promise<CvAnalysisResult> {
  const body = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: CV_SYSTEM_PROMPT,
    messages: [
      { role: 'user',      content: `CV tekst:\n${cvText}` },
      { role: 'assistant', content: '{' },
    ],
  };

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(
      `Claude API fout (HTTP ${resp.status}): ${errBody?.error?.message ?? 'onbekend'}`,
    );
  }

  const data = await resp.json() as {
    content: Array<{ type: string; text: string }>;
    stop_reason: string;
  };

  const raw = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  // De assistant-prefill '{'  werd meegestuurd — voeg hem terug toe als hij er niet inzit
  const jsonStr = raw.trimStart().startsWith('{') ? raw : '{' + raw;

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Probeer trailing-comma of kleinere problemen te herstellen
    const repaired = jsonStr
      .replace(/,(\s*[}\]])/g, '$1')   // trailing komma's
      .replace(/[\u201C\u201D]/g, '"'); // typografische quotes
    parsed = JSON.parse(repaired);
  }

  return parsed as CvAnalysisResult;
}

// ─── Express app ──────────────────────────────────────────────────────────────

const app = express();

// JSON body parsing — max 1MB voor webhook payloads
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Webhook endpoint ──────────────────────────────────────────────────────────
/**
 * POST /webhook/cv-job
 *
 * Wordt aangeroepen door een Supabase Database Webhook zodra een rij in
 * cv_analysis_jobs wordt aangemaakt (INSERT event, status = 'pending').
 *
 * Configuratie in Supabase Dashboard:
 *   Database → Webhooks → New Webhook
 *   Table:   cv_analysis_jobs
 *   Events:  INSERT
 *   URL:     https://<jouw-server>/webhook/cv-job
 *   Headers: x-webhook-secret: <waarde uit .env WEBHOOK_SECRET>
 */
app.post(
  '/webhook/cv-job',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // ── 1. Webhook-secret validatie ────────────────────────────────────────────
    const secret = req.headers['x-webhook-secret'];
    if (secret !== WEBHOOK_SECRET) {
      res.status(401).json({ error: 'Ongeldig webhook secret.' });
      return;
    }

    const payload = req.body as WebhookPayload;

    // Alleen INSERT events op cv_analysis_jobs met status 'pending' verwerken
    if (
      payload.type !== 'INSERT' ||
      payload.table !== 'cv_analysis_jobs' ||
      payload.record?.status !== 'pending'
    ) {
      res.status(200).json({ skipped: true });
      return;
    }

    const { id: jobId, file_path: filePath, file_name: fileName } = payload.record;

    // Stuur 200 direct terug zodat Supabase niet opnieuw probeert (timeout)
    res.status(200).json({ received: true, jobId });

    // ── 2. Verwerk de job asynchroon (na de response) ─────────────────────────
    try {
      // Markeer als 'processing'
      await supabaseAdmin
        .from('cv_analysis_jobs')
        .update({ status: 'processing' })
        .eq('id', jobId)
        .throwOnError();

      console.log(`[job:${jobId}] Bezig: "${fileName}" (${filePath})`);

      // Stap 1: Download
      const buffer = await downloadFile(filePath);

      // Stap 2: Tekst-extractie
      const rawText = await extractText(buffer, fileName);
      const cleanedText = cleanText(rawText);

      console.log(`[job:${jobId}] Tekst geëxtraheerd: ${cleanedText.length} tekens`);

      // Stap 3: Claude Haiku analyse
      const resultData = await analyseWithClaude(cleanedText);

      console.log(`[job:${jobId}] Analyse klaar:`, {
        skills: resultData.hard_skills?.length,
        jaren:  resultData.werkervaring_jaren,
      });

      // Stap 4: Opslaan → triggert Realtime update naar frontend
      await supabaseAdmin
        .from('cv_analysis_jobs')
        .update({ status: 'completed', result_data: resultData })
        .eq('id', jobId)
        .throwOnError();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      await failJob(jobId, message);
    }
  },
);

// Globale foutafhandeling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server] Onverwachte fout:', err);
  res.status(500).json({ error: 'Interne serverfout.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[server] TalentLens CV-backend luistert op poort ${PORT}`);
  console.log(`[server] Webhook endpoint: POST http://localhost:${PORT}/webhook/cv-job`);
});

export default app;
