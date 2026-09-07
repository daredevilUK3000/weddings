"use client";

import { useState, useTransition } from "react";
import { deleteCeremony } from "@/app/dashboard/actions";

function ConfirmDialog({
  pending,
  onCancel,
  onConfirm,
}: {
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-sm border border-ink/10 bg-white px-6 py-6 shadow-lg">
        <div>
          <h2 className="font-serif text-xl font-medium">Delete this ceremony?</h2>
          <p className="mt-2 text-sm text-ink-soft">
            This permanently removes your ceremony script, vows, vendor shortlist, budget,
            witnesses, and certificate. This cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-sm px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-sm bg-wine px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-wine/90 disabled:opacity-40"
          >
            {pending ? "Deleting…" : "Delete ceremony"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Shared confirm-and-delete flow, rendered either as a dashboard-card kebab
// menu or a plain "Danger zone" button (see `variant`). Both call the same
// server action, which cascades the delete through every table tied to the
// ceremony.
export function DeleteCeremonyButton({
  ceremonyId,
  variant,
}: {
  ceremonyId: string;
  variant: "kebab" | "danger-zone";
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      await deleteCeremony(ceremonyId);
    });
  }

  return (
    <>
      {variant === "kebab" ? (
        <div className="relative">
          <button
            type="button"
            aria-label="Ceremony options"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-parchment hover:text-ink"
          >
            <span aria-hidden className="text-lg leading-none">
              ⋯
            </span>
          </button>
          {menuOpen ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-sm border border-ink/10 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(false);
                    setConfirming(true);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-wine hover:bg-parchment"
                >
                  Delete ceremony
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-sm border border-wine/30 bg-wine/5 px-6 py-6">
          <div>
            <h2 className="text-lg font-medium text-wine">Danger zone</h2>
            <p className="mt-1 max-w-xl text-sm text-ink-soft">
              Permanently delete this ceremony and everything in it — script, vows, vendor
              shortlist, budget, witnesses, and certificate.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="w-fit rounded-sm border border-wine px-4 py-2 text-sm font-medium text-wine transition-colors hover:bg-wine hover:text-ivory"
          >
            Delete ceremony
          </button>
        </div>
      )}

      {confirming ? (
        <ConfirmDialog
          pending={pending}
          onCancel={() => setConfirming(false)}
          onConfirm={confirm}
        />
      ) : null}
    </>
  );
}
