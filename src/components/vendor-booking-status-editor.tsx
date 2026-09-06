"use client";

import { useState } from "react";
import type { VendorBookingStatus } from "@/lib/types/database";

const STATUS_OPTIONS: VendorBookingStatus[] = [
  "not_contacted",
  "contacted",
  "responded",
  "booked",
  "confirmed",
  "arrived",
  "completed",
];

const STATUS_LABEL: Record<VendorBookingStatus, string> = {
  not_contacted: "Not contacted",
  contacted: "Contacted",
  responded: "Responded",
  booked: "Booked",
  confirmed: "Confirmed",
  arrived: "Arrived",
  completed: "Completed",
};

export interface VendorBookingData {
  id: string;
  bookingStatus: VendorBookingStatus;
  contactPerson: string | null;
  contactPhone: string | null;
  bookingReference: string | null;
  arrivalTime: string | null;
  serviceStartTime: string | null;
  serviceEndTime: string | null;
  amountOutstanding: number | null;
  vendorNotes: string | null;
}

function rowToVendorBookingData(row: Record<string, unknown>): VendorBookingData {
  return {
    id: row.id as string,
    bookingStatus: row.booking_status as VendorBookingStatus,
    contactPerson: (row.contact_person as string | null) ?? null,
    contactPhone: (row.contact_phone as string | null) ?? null,
    bookingReference: (row.booking_reference as string | null) ?? null,
    arrivalTime: (row.arrival_time as string | null) ?? null,
    serviceStartTime: (row.service_start_time as string | null) ?? null,
    serviceEndTime: (row.service_end_time as string | null) ?? null,
    amountOutstanding: (row.amount_outstanding as number | null) ?? null,
    vendorNotes: (row.vendor_notes as string | null) ?? null,
  };
}

export function VendorBookingStatusEditor({
  vendor,
  onUpdated,
}: {
  vendor: VendorBookingData;
  onUpdated?: (next: VendorBookingData) => void;
}) {
  const [fields, setFields] = useState(vendor);
  const [draft, setDraft] = useState(vendor);
  const [expanded, setExpanded] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  async function patch(body: Record<string, unknown>): Promise<VendorBookingData | null> {
    const res = await fetch("/api/vendors/booking-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorShortlistId: vendor.id, ...body }),
    });
    if (!res.ok) return null;
    return rowToVendorBookingData(await res.json());
  }

  async function handleStatusChange(status: VendorBookingStatus) {
    setSavingStatus(true);
    const next = await patch({ bookingStatus: status });
    setSavingStatus(false);
    if (next) {
      setFields(next);
      setDraft(next);
      onUpdated?.(next);
    }
  }

  async function handleSaveDetails() {
    setSavingDetails(true);
    const next = await patch({
      contactPerson: draft.contactPerson || null,
      contactPhone: draft.contactPhone || null,
      bookingReference: draft.bookingReference || null,
      arrivalTime: draft.arrivalTime || null,
      serviceStartTime: draft.serviceStartTime || null,
      serviceEndTime: draft.serviceEndTime || null,
      amountOutstanding:
        draft.amountOutstanding === null || Number.isNaN(draft.amountOutstanding)
          ? null
          : draft.amountOutstanding,
      vendorNotes: draft.vendorNotes || null,
    });
    setSavingDetails(false);
    if (next) {
      setFields(next);
      setDraft(next);
      onUpdated?.(next);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-ink/10 bg-parchment/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <select
          value={fields.bookingStatus}
          onChange={(e) => handleStatusChange(e.target.value as VendorBookingStatus)}
          disabled={savingStatus}
          className="rounded-sm border border-ink/15 bg-white px-2 py-1 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-ink-soft underline underline-offset-2"
        >
          {expanded ? "Hide details" : "Contact & logistics"}
        </button>
      </div>

      {expanded ? (
        <div className="flex flex-col gap-2 border-t border-ink/8 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Contact person"
              value={draft.contactPerson ?? ""}
              onChange={(e) => setDraft({ ...draft, contactPerson: e.target.value })}
              className="rounded-sm border border-ink/15 bg-white px-2 py-1.5 text-sm"
            />
            <input
              placeholder="Contact phone"
              value={draft.contactPhone ?? ""}
              onChange={(e) => setDraft({ ...draft, contactPhone: e.target.value })}
              className="rounded-sm border border-ink/15 bg-white px-2 py-1.5 text-sm"
            />
            <input
              placeholder="Booking reference"
              value={draft.bookingReference ?? ""}
              onChange={(e) => setDraft({ ...draft, bookingReference: e.target.value })}
              className="rounded-sm border border-ink/15 bg-white px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount outstanding"
              value={draft.amountOutstanding ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  amountOutstanding: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="rounded-sm border border-ink/15 bg-white px-2 py-1.5 text-sm"
            />
            <label className="flex flex-col gap-1 text-xs text-ink-soft">
              Arrival time
              <input
                type="time"
                value={draft.arrivalTime ?? ""}
                onChange={(e) => setDraft({ ...draft, arrivalTime: e.target.value })}
                className="rounded-sm border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-soft">
              Service start
              <input
                type="time"
                value={draft.serviceStartTime ?? ""}
                onChange={(e) => setDraft({ ...draft, serviceStartTime: e.target.value })}
                className="rounded-sm border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-soft">
              Service end
              <input
                type="time"
                value={draft.serviceEndTime ?? ""}
                onChange={(e) => setDraft({ ...draft, serviceEndTime: e.target.value })}
                className="rounded-sm border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink"
              />
            </label>
          </div>
          <textarea
            placeholder="Notes"
            value={draft.vendorNotes ?? ""}
            onChange={(e) => setDraft({ ...draft, vendorNotes: e.target.value })}
            rows={2}
            className="rounded-sm border border-ink/15 bg-white px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={handleSaveDetails}
            disabled={savingDetails}
            className="w-fit rounded-sm border border-ink/15 bg-white px-3 py-1.5 text-xs font-medium hover:border-champagne disabled:opacity-50"
          >
            {savingDetails ? "Saving…" : "Save details"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
