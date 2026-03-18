-- Migration: voeg source_url en location kolommen toe aan analyses tabel
-- source_url: URL van de gescande vacaturepagina (optioneel)
-- location:   geëxtraheerde werklocatie (optioneel, voor snellere queries zonder JSON-parsing)

ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS location   text;

COMMENT ON COLUMN analyses.source_url IS 'Oorspronkelijke URL van de gescande vacaturepagina';
COMMENT ON COLUMN analyses.location   IS 'Werklocatie geëxtraheerd uit de vacature- of profieltekst';
