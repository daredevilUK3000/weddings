-- Witness sharing correction (amends v2 brief §6.2/§9.3 — see
-- Witness_Circle_Sharing_Correction.md). Replaces the flat, ceremony-wide
-- manual sharing checklist with per-witness sharing derived from
-- attendance_type, plus exactly one manual override (vows).
--
-- Run this manually in the Supabase SQL editor, same as 0001-0003.

alter table public.ceremonies
  drop column share_vows,
  drop column share_ceremony_story,
  drop column share_programme,
  drop column share_certificate,
  drop column share_photographs,
  drop column share_livestream;

-- The one optional per-witness override the correction allows ("Also share
-- the vows"). Everything else a witness sees is derived from attendance_type
-- (src/lib/witness-sharing.ts) — never stored, never independently toggled.
alter table public.witnesses
  add column share_vows boolean not null default false;
