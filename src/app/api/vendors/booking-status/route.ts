import { createClient } from "@/lib/supabase/server";
import type { Database, VendorBookingStatus } from "@/lib/types/database";

type VendorShortlistUpdate = Database["public"]["Tables"]["vendor_shortlist"]["Update"];

const VALID_STATUSES: VendorBookingStatus[] = [
  "not_contacted",
  "contacted",
  "responded",
  "booked",
  "confirmed",
  "arrived",
  "completed",
];

interface BookingStatusPatch {
  vendorShortlistId?: string;
  bookingStatus?: string;
  contactPerson?: string | null;
  contactPhone?: string | null;
  bookingReference?: string | null;
  arrivalTime?: string | null;
  serviceStartTime?: string | null;
  serviceEndTime?: string | null;
  amountOutstanding?: number | null;
  vendorNotes?: string | null;
}

export async function PATCH(req: Request) {
  const body: BookingStatusPatch = await req.json();
  const { vendorShortlistId } = body;
  if (!vendorShortlistId) {
    return Response.json({ error: "vendorShortlistId is required" }, { status: 400 });
  }

  const update: VendorShortlistUpdate = {};
  if (body.bookingStatus !== undefined) {
    if (!VALID_STATUSES.includes(body.bookingStatus as VendorBookingStatus)) {
      return Response.json({ error: "Invalid booking status" }, { status: 400 });
    }
    update.booking_status = body.bookingStatus as VendorBookingStatus;
  }
  if (body.contactPerson !== undefined) update.contact_person = body.contactPerson;
  if (body.contactPhone !== undefined) update.contact_phone = body.contactPhone;
  if (body.bookingReference !== undefined) update.booking_reference = body.bookingReference;
  if (body.arrivalTime !== undefined) update.arrival_time = body.arrivalTime;
  if (body.serviceStartTime !== undefined) update.service_start_time = body.serviceStartTime;
  if (body.serviceEndTime !== undefined) update.service_end_time = body.serviceEndTime;
  if (body.amountOutstanding !== undefined) update.amount_outstanding = body.amountOutstanding;
  if (body.vendorNotes !== undefined) update.vendor_notes = body.vendorNotes;

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
    .from("vendor_shortlist")
    .update(update)
    .eq("id", vendorShortlistId)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: "Vendor not found" }, { status: 404 });
  }

  return Response.json(data);
}
