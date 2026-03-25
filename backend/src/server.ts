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
import { timingSafeEqual } from 'crypto';
import express, { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { z } from 'zod';
import type { Database, CvAnalysisResult, WebhookPayload } from './types/database.types';
import {
  getTravelTime,
  getCompanyLogo,
  getSalaryIndication,
} from './services/background-enrichment.service';

// ─── Omgevingsvariabelen valideren ────────────────────────────────────────────

const SUPABASE_URL          = process.env.SUPABASE_URL          ?? '';
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ANTHROPIC_API_KEY     = process.env.ANTHROPIC_API_KEY     ?? '';
const WEBHOOK_SECRET        = process.env.WEBHOOK_SECRET        ?? '';
const PORT                  = parseInt(process.env.PORT ?? '3001', 10);
/** Kantoor-postcode voor reistijdberekening. Stel in via OFFICE_ZIP_CODE env var. */
const OFFICE_ZIP_CODE       = process.env.OFFICE_ZIP_CODE       ?? '1012AB';

for (const [key, val] of Object.entries({ SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY, WEBHOOK_SECRET })) {
  if (!val) {
    console.error(`[server] Ontbrekende omgevingsvariabele: ${key}. Zie .env.example.`);
    process.exit(1);
  }
}

// ─── Supabase admin client (service role — geen RLS) ─────────────────────────

const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Types ────────────────────────────────────────────────────────────────────
// CvAnalysisResult en WebhookPayload zijn geïmporteerd uit ./types/database.types

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Schrijft een fout naar cv_analysis_jobs en logt het lokaal. */
async function failJob(jobId: string, message: string): Promise<void> {
  console.error(`[job:${jobId}] FOUT:`, message);
  const { error: dbErr } = await supabaseAdmin
    .from('cv_analysis_jobs')
    .update({ status: 'error' as const, error_message: message })
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

/** Pre-processing: verwijder overbodige whitespace en non-printable tekens. */
function cleanText(raw: string): string {
  return raw
    // Vervang alle horizontale whitespace (spaties/tabs) door één spatie,
    // behoud newlines zodat de regex hierna ze apart kan normaliseren.
    .replace(/[^\S\n]+/g, ' ')
    // Drie of meer opeenvolgende newlines → twee (maximaal één lege regel).
    .replace(/\n{3,}/g, '\n\n')
    // Non-printable/non-Latin tekens naar spatie (behoudt ASCII + Latin Extended).
    .replace(/[^\x20-\x7E\n\r\u00C0-\u024F]/g, ' ')
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
    // ── 1. Webhook-secret + Content-Type validatie ─────────────────────────────
    const secret = req.headers['x-webhook-secret'];
    const secretValid =
      typeof secret === 'string' &&
      secret.length === WEBHOOK_SECRET.length &&
      timingSafeEqual(Buffer.from(secret, 'utf8'), Buffer.from(WEBHOOK_SECRET, 'utf8'));
    if (!secretValid) {
      res.status(401).json({ error: 'Ongeldig webhook secret.' });
      return;
    }
    if (!req.headers['content-type']?.includes('application/json')) {
      res.status(415).json({ error: 'Content-Type moet application/json zijn.' });
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
        .update({ status: 'processing' as const })
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
        .update({ status: 'completed' as const, result_data: resultData })
        .eq('id', jobId)
        .throwOnError();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      await failJob(jobId, message);
    }
  },
);

// ── Candidate Enrichment Webhook ──────────────────────────────────────────────
/**
 * POST /api/webhooks/candidate-enrichment
 *
 * Aangeroepen door Supabase Database Webhook zodra een kandidaat wordt
 * ingevoegd in de `candidates` tabel (INSERT event).
 *
 * Flow:
 *   1. Verificeer webhook-secret header (timing-safe)
 *   2. Valideer payload-structuur met Zod
 *   3. Stuur 200 direct terug (Supabase-timeout vermijden)
 *   4. Enrichment parallel: Mapbox + Brandfetch + Adzuna
 *   5. Update candidates record via service-role client
 *
 * Supabase Dashboard configuratie:
 *   Database → Webhooks → New Webhook
 *   Table:   candidates  |  Events: INSERT
 *   URL:     https://<server>/api/webhooks/candidate-enrichment
 *   Headers: x-webhook-secret: <WEBHOOK_SECRET>
 */

// Zod-schema voor het `record` object uit de Supabase INSERT payload
const CandidateRecordSchema = z.object({
  id:           z.string().uuid(),
  job_title:    z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  zip_code:     z.string().nullable().optional(),
  recruiter_id: z.string().uuid().nullable().optional(),
});

// Zod-schema voor de volledige Supabase webhook payload
const CandidateWebhookPayloadSchema = z.object({
  type:       z.enum(['INSERT', 'UPDATE', 'DELETE']),
  table:      z.string(),
  schema:     z.string(),
  record:     CandidateRecordSchema,
  old_record: CandidateRecordSchema.nullable().optional(),
});

type CandidateWebhookPayload = z.infer<typeof CandidateWebhookPayloadSchema>;

app.post(
  '/api/webhooks/candidate-enrichment',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // ── 1. Webhook-secret verificatie (timing-safe) ───────────────────────────
    const incomingSecret = req.headers['x-webhook-secret'];
    const secretValid =
      typeof incomingSecret === 'string' &&
      incomingSecret.length === WEBHOOK_SECRET.length &&
      timingSafeEqual(
        Buffer.from(incomingSecret, 'utf8'),
        Buffer.from(WEBHOOK_SECRET, 'utf8'),
      );

    if (!secretValid) {
      res.status(401).json({ error: 'Ongeldig webhook secret.' });
      return;
    }

    if (!req.headers['content-type']?.includes('application/json')) {
      res.status(415).json({ error: 'Content-Type moet application/json zijn.' });
      return;
    }

    // ── 2. Payload-validatie via Zod ─────────────────────────────────────────
    const parseResult = CandidateWebhookPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.warn('[enrichment] Ongeldige payload:', parseResult.error.flatten());
      res.status(400).json({ error: 'Ongeldige webhook payload.', details: parseResult.error.flatten() });
      return;
    }

    const payload: CandidateWebhookPayload = parseResult.data;

    // Alleen INSERT events op de candidates tabel verwerken
    if (payload.type !== 'INSERT' || payload.table !== 'candidates') {
      res.status(200).json({ skipped: true, reason: 'Geen INSERT op candidates.' });
      return;
    }

    const { id: candidateId, job_title, company_name, zip_code, recruiter_id } = payload.record;

    // ── 3. Stuur 200 direct terug (Supabase wacht max ~5s) ───────────────────
    res.status(200).json({ received: true, candidateId });

    // ── 4 + 5. Enrichment parallel + database-update (na de response) ────────
    try {
      console.log(`[enrichment:${candidateId}] Start parallel enrichment…`);

      // Haal kantoorpostcode op uit user_settings van de recruiter.
      // Fallback op OFFICE_ZIP_CODE env var als de gebruiker hem nog niet heeft ingesteld.
      let officeZip = OFFICE_ZIP_CODE;
      if (recruiter_id) {
        const { data: settings } = await supabaseAdmin
          .from('user_settings')
          .select('office_zip_code')
          .eq('user_id', recruiter_id)
          .maybeSingle();
        if (settings?.office_zip_code) {
          officeZip = settings.office_zip_code as string;
        }
      }

      const [travelResult, logoResult, salaryResult] = await Promise.all([
        getTravelTime(zip_code ?? '', officeZip),
        getCompanyLogo(company_name ?? ''),
        getSalaryIndication(job_title ?? ''),
      ]);

      console.log(`[enrichment:${candidateId}] Resultaten:`, {
        travel_minutes: travelResult.duration_minutes,
        logo_found:     !!logoResult.logo_url,
        salary_min:     salaryResult.min_gross_annual,
      });

      // ── 6. Update candidates via service-role (bypast RLS) ─────────────────
      const { error: updateError } = await supabaseAdmin
        .from('candidates')
        .update({
          travel_time:        travelResult,
          company_logo_url:   logoResult.logo_url,
          salary_indication:  salaryResult,
        })
        .eq('id', candidateId);

      if (updateError) {
        console.error(`[enrichment:${candidateId}] DB-update mislukt:`, updateError.message);
      } else {
        console.log(`[enrichment:${candidateId}] Succesvol opgeslagen.`);
      }
    } catch (err: unknown) {
      // Fatale fout (bijv. netwerk volledig down) — logt maar stopt de server niet
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[enrichment:${candidateId}] Onverwachte fout:`, message);
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
