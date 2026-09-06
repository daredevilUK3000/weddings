import { createClient } from "@/lib/supabase/server";
import type { Database, TimelineEventStatus } from "@/lib/types/database";

type CeremonyTimelineUpdate = Database["public"]["Tables"]["ceremony_timeline"]["Update"];

// Allowlisted to day-of fields only — moment_name, order_index, and
// moment_kind stay Builder-owned. Wedding Director reads the sequence,
// it never edits it.
const VALID_STATUSES: TimelineEventStatus[] = [
  "upcoming",
  "ready",
  "active",
  "delayed",
  "completed",
  "skipped",
];

interface TimelineStatusPatch {
  momentId?: string;
  eventStatus?: string;
  actualStartAt?: string | null;
  actualEndAt?: string | null;
}

export async function PATCH(req: Request) {
  const body: TimelineStatusPatch = await req.json();
  const { momentId } = body;
  if (!momentId) {
    return Response.json({ error: "momentId is required" }, { status: 400 });
  }

  const update: CeremonyTimelineUpdate = {};
  if (body.eventStatus !== undefined) {
    if (!VALID_STATUSES.includes(body.eventStatus as TimelineEventStatus)) {
      return Response.json({ error: "Invalid event status" }, { status: 400 });
    }
    update.event_status = body.eventStatus as TimelineEventStatus;
  }
  if (body.actualStartAt !== undefined) update.actual_start_at = body.actualStartAt;
  if (body.actualEndAt !== undefined) update.actual_end_at = body.actualEndAt;

  if (Object.keys(update).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("ceremony_timeline")
    .update(update)
    .eq("id", momentId)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: "Moment not found" }, { status: 404 });
  }

  return Response.json(data);
}
