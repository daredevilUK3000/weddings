import { createClient } from "@/lib/supabase/server";
import { computeReadiness } from "@/lib/director/readiness";
import type { CeremonyStatus } from "@/lib/types/database";

// Single enforcement point for ceremonies.status — nothing else writes this
// column. Two transitions are lazy/computed (evaluated idempotently on page
// load, same idiom as the builder's seedTimeline()); three are explicit
// user actions gated through advanceStatus(). All five are forward-only.

export async function ensureStatusProgression(ceremonyId: string): Promise<void> {
  const supabase = await createClient();
  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("status, ceremony_script, vows, date, location, start_time")
    .eq("id", ceremonyId)
    .single();
  if (!ceremony) return;

  let nextStatus: CeremonyStatus | null = null;

  if (ceremony.status === "planning" || ceremony.status === "confirmed") {
    if (ceremony.ceremony_script && ceremony.vows && ceremony.date && ceremony.location) {
      nextStatus = "preparing";
    }
  } else if (ceremony.status === "preparing") {
    const { data: vendors } = await supabase
      .from("vendor_shortlist")
      .select("booking_status")
      .eq("ceremony_id", ceremonyId);
    const readiness = computeReadiness(ceremony, vendors ?? []);
    if (readiness.essentialComplete) {
      nextStatus = "ready";
    }
  }

  if (nextStatus) {
    await supabase.from("ceremonies").update({ status: nextStatus }).eq("id", ceremonyId);
  }
}

export type DirectorAction = "start_wedding_day" | "begin_ceremony" | "finish_ceremony";

const ACTION_TRANSITIONS: Record<DirectorAction, { from: CeremonyStatus; to: CeremonyStatus }> = {
  start_wedding_day: { from: "ready", to: "wedding_day" },
  begin_ceremony: { from: "wedding_day", to: "ceremony_active" },
  finish_ceremony: { from: "ceremony_active", to: "completed" },
};

function isCeremonyDateToday(date: string | null): boolean {
  if (!date) return false;
  return date === new Date().toISOString().slice(0, 10);
}

export async function advanceStatus(
  ceremonyId: string,
  action: DirectorAction,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const transition = ACTION_TRANSITIONS[action];
  if (!transition) return { ok: false, reason: "Unknown action" };

  const supabase = await createClient();
  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("status, date")
    .eq("id", ceremonyId)
    .single();
  if (!ceremony) return { ok: false, reason: "Ceremony not found" };

  if (ceremony.status !== transition.from) {
    return { ok: false, reason: `Cannot ${action} from status "${ceremony.status}"` };
  }

  if (action === "start_wedding_day" && !isCeremonyDateToday(ceremony.date)) {
    return { ok: false, reason: "Wedding Day can only start on the ceremony date" };
  }

  const { error } = await supabase
    .from("ceremonies")
    .update({ status: transition.to })
    .eq("id", ceremonyId);
  if (error) return { ok: false, reason: error.message };

  return { ok: true };
}
