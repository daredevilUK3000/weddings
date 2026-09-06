-- Witness Contribution as a Ceremony Builder element (Phase 3 of the
-- Wedding Director + Witness Circle plan). Not a second editable
-- structure — an ordinary ceremony_timeline row, tagged so Wedding
-- Director's Ceremony Mode can recognize it even if the couple renames
-- its display label.
--
-- Run this manually in the Supabase SQL editor, same as 0001-0004.

alter table public.ceremony_timeline
  add column moment_kind text check (moment_kind in ('witness_contribution'));
