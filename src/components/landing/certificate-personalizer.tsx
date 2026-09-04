"use client";

import { useState } from "react";
import { CertCorner } from "@/components/cert-corner";
import { SealIcon } from "@/components/monogram";
import { formatCeremonyDate } from "@/lib/format-ceremony-date";

const TODAY = formatCeremonyDate(new Date().toISOString().slice(0, 10));

export function CertificatePersonalizer() {
  const [name, setName] = useState("");
  const displayName = name.trim() || "Your Name";

  return (
    <div className="flex aspect-3/4 flex-col items-center gap-5 rounded bg-ink p-8">
      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-1 rounded-xs border border-champagne bg-ivory px-8 py-8 text-center">
        <CertCorner at="topLeft" />
        <CertCorner at="topRight" />
        <CertCorner at="bottomLeft" />
        <CertCorner at="bottomRight" />

        <SealIcon className="mb-2 h-14 w-14" />
        <div className="text-xs tracking-[0.2em] text-ink">WEDDINGS FOR ONE</div>
        <div className="mt-3 font-serif text-4xl font-semibold tracking-[0.1em] text-champagne">
          CERTIFICATE
        </div>
        <div className="text-xs tracking-[0.25em] text-ink">OF SELF-COMMITMENT</div>
        <div className="my-3 h-px w-14 bg-champagne" />
        <div
          className={`font-script text-6xl transition-colors ${name.trim() ? "text-champagne" : "text-champagne/40"}`}
        >
          {displayName}
        </div>
        <div className="mt-3 text-xs tracking-[0.15em] text-ink-soft">
          COMMITTED TO THEMSELF ON
        </div>
        <div className="font-script text-3xl text-ink">{TODAY}</div>
      </div>

      <div className="w-full max-w-xs">
        <label htmlFor="cert-name-preview" className="sr-only">
          Type your name to preview your certificate
        </label>
        <input
          id="cert-name-preview"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value.slice(0, 40))}
          placeholder="Type your name…"
          autoComplete="off"
          className="w-full rounded-sm border border-ivory/25 bg-transparent px-4 py-2.5 text-center text-sm text-ivory placeholder:text-ivory/40 focus:border-champagne focus:outline-none"
        />
        <p className="mt-2 text-center text-[11px] tracking-wide text-ivory/50">
          See your name on the certificate — no account needed
        </p>
      </div>
    </div>
  );
}
