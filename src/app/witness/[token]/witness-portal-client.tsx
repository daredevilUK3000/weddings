"use client";

import { useState } from "react";
import { SignaturePad } from "@/components/signature-pad";
import type { SignatureType, WitnessAttendanceType, WitnessRsvpStatus } from "@/lib/types/database";

const CHECKIN_LABEL: Partial<Record<WitnessAttendanceType, string>> = {
  in_person: "I'm Here",
  online: "I'm Watching",
};

// An explicit locale keeps this identical between the server-rendered HTML
// and the client hydration pass — omitting it uses each environment's
// default locale, which differ (server vs. browser) and trip a hydration
// mismatch.
function formatSignedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface Props {
  token: string;
  witness: {
    attendanceType: WitnessAttendanceType;
    canSignCertificate: boolean;
    rsvpStatus: WitnessRsvpStatus | null;
    checkedInAt: string | null;
    contribution: { body: string; includeInCeremony: boolean } | null;
    signature: { signatureType: SignatureType; signedAt: string } | null;
  };
}

export function WitnessPortalClient({ token, witness }: Props) {
  const [rsvpStatus, setRsvpStatus] = useState(witness.rsvpStatus);
  const [checkedInAt, setCheckedInAt] = useState(witness.checkedInAt);
  const [message, setMessage] = useState(witness.contribution?.body ?? "");
  const [includeInCeremony, setIncludeInCeremony] = useState(
    witness.contribution?.includeInCeremony ?? false,
  );
  const [messageSaved, setMessageSaved] = useState(!!witness.contribution);
  const [signature, setSignature] = useState(witness.signature);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitRsvp(status: "accepted" | "declined") {
    setSubmitting("rsvp");
    setError(null);
    const res = await fetch(`/api/witness/${token}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSubmitting(null);
    if (res.ok) setRsvpStatus(status);
    else setError("Something went wrong — please try again.");
  }

  async function submitMessage() {
    setSubmitting("message");
    setError(null);
    const res = await fetch(`/api/witness/${token}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: message, includeInCeremony }),
    });
    setSubmitting(null);
    if (res.ok) setMessageSaved(true);
    else setError("Something went wrong — please try again.");
  }

  async function submitCheckin() {
    setSubmitting("checkin");
    setError(null);
    const res = await fetch(`/api/witness/${token}/checkin`, { method: "POST" });
    setSubmitting(null);
    if (res.ok) setCheckedInAt(new Date().toISOString());
    else setError("Something went wrong — please try again.");
  }

  async function submitSignature(signatureType: SignatureType, signatureData: string) {
    setSubmitting("sign");
    setError(null);
    const res = await fetch(`/api/witness/${token}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signatureType, signatureData, consent: true }),
    });
    setSubmitting(null);
    if (res.ok) {
      setSignature({ signatureType, signedAt: new Date().toISOString() });
    } else {
      setError("Something went wrong — please try again.");
    }
  }

  const canCheckIn = witness.attendanceType === "in_person" || witness.attendanceType === "online";

  return (
    <div className="flex flex-col gap-8">
      {error ? <p className="text-sm text-wine">{error}</p> : null}

      {rsvpStatus === null ? (
        <div className="flex flex-col gap-3 rounded-sm border border-ink/10 bg-white/60 p-5">
          <p className="text-sm">Will you be part of the Witness Circle?</p>
          <div className="flex gap-3">
            <button
              onClick={() => submitRsvp("accepted")}
              disabled={submitting === "rsvp"}
              className="rounded-sm bg-ink px-4 py-2 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine disabled:opacity-50"
            >
              Accept Invitation
            </button>
            <button
              onClick={() => submitRsvp("declined")}
              disabled={submitting === "rsvp"}
              className="rounded-sm border border-ink/15 px-4 py-2 text-sm text-ink-soft hover:border-champagne"
            >
              Decline
            </button>
          </div>
        </div>
      ) : rsvpStatus === "declined" ? (
        <p className="text-sm text-ink-soft">
          You&apos;ve let them know you won&apos;t be able to be part of this.
        </p>
      ) : (
        <>
          <p className="text-sm text-champagne">
            You&apos;ve accepted — thank you for being part of this.
          </p>

          <section className="flex flex-col gap-3 rounded-sm border border-ink/10 bg-white/60 p-5">
            <h2 className="text-lg font-medium">Leave a message</h2>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setMessageSaved(false);
              }}
              rows={4}
              placeholder="Write a message for them..."
              className="rounded-sm border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-champagne"
            />
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={includeInCeremony}
                onChange={(e) => {
                  setIncludeInCeremony(e.target.checked);
                  setMessageSaved(false);
                }}
              />
              I&apos;d like this shared during the ceremony
            </label>
            <button
              onClick={submitMessage}
              disabled={submitting === "message" || !message.trim()}
              className="w-fit rounded-sm bg-ink px-4 py-2 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine disabled:opacity-50"
            >
              {messageSaved ? "Saved" : submitting === "message" ? "Saving…" : "Save message"}
            </button>
          </section>

          {canCheckIn ? (
            <section className="flex flex-col gap-3 rounded-sm border border-ink/10 bg-white/60 p-5">
              <h2 className="text-lg font-medium">On the day</h2>
              {checkedInAt ? (
                <p className="text-sm text-champagne">You&apos;re checked in.</p>
              ) : (
                <button
                  onClick={submitCheckin}
                  disabled={submitting === "checkin"}
                  className="w-fit rounded-sm border border-ink/15 bg-white px-4 py-2 text-sm font-medium hover:border-champagne disabled:opacity-50"
                >
                  {CHECKIN_LABEL[witness.attendanceType] ?? "I'm Here"}
                </button>
              )}
            </section>
          ) : null}

          {witness.canSignCertificate ? (
            <section className="flex flex-col gap-3 rounded-sm border border-ink/10 bg-white/60 p-5">
              <h2 className="text-lg font-medium">Sign the certificate</h2>
              {signature ? (
                <p className="text-sm text-champagne">
                  You signed on {formatSignedDate(signature.signedAt)}.
                </p>
              ) : (
                <SignaturePad onSubmit={submitSignature} submitting={submitting === "sign"} />
              )}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
