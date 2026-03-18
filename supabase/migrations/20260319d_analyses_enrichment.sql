-- Migration: voeg company_metadata en location_structured toe aan analyses tabel
-- company_metadata:   { name, logo_url, industry }
-- location_structured: { city, region, country, type: 'city'|'region'|'remote'|'unknown' }

ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS company_metadata    jsonb,
  ADD COLUMN IF NOT EXISTS location_structured jsonb;

COMMENT ON COLUMN analyses.company_metadata
  IS '{"name":"Siemens Healthineers","logo_url":"https://cdn.example.com/logo.png","industry":"Medical Devices"}';

COMMENT ON COLUMN analyses.location_structured
  IS '{"city":"Amsterdam","region":"Noord-Holland","country":"NL","type":"city"}';

-- Index voor snelle regio-filtering (bijv. alle vacatures in "Noord-Holland")
CREATE INDEX IF NOT EXISTS analyses_location_region_idx
  ON analyses ((location_structured->>'region'));
