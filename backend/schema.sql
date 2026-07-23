-- MedScribe / Bench2Bedside — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- The backend uses the service-role key, so Row-Level Security is not required
-- for the app to function.

create table if not exists transcriptions (
    id             uuid primary key default gen_random_uuid(),
    patient_id     text not null,              -- free-text patient identifier (searched via ILIKE)
    transcript     text,                       -- raw Deepgram transcript
    title          text,                       -- visit title
    forms          jsonb,                      -- the 20 extracted fields, saved as JSON
    time_completed timestamptz default now()   -- ordered desc for the visit history
);

-- Speeds up the per-patient visit lookups used across the app.
create index if not exists transcriptions_patient_id_idx
    on transcriptions (patient_id);
