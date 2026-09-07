"use client";

import { useState, useTransition } from "react";
import { deleteCeremony, startOverCeremony } from "@/app/dashboard/actions";

type Action = "start-over" | "delete";

const COPY: Record<
  Action,
  { title: string; body: string; confirmLabel: string; pendingLabel: string }
> = {
  "start-over": {
    title: "Start over on this ceremony?",
    body: "This clears your script, vows, timeline, vendor shortlist, budget, and witnesses — but keeps your date, location, and other basic details. This cannot be undone.",
    confirmLabel: "Start over",
    pendingLabel: "Clearing…",
  },
  delete: {
    title: "Delete this ceremony?",
    body: "This permanently removes your ceremony script, vows, vendor shortlist, budget, witnesses, and certificate. This cannot be undone.",
    confirmLabel: "Delete ceremony",
    pendingLabel: "Deleting…",
  },
};

function ConfirmDialog({
  action,
  pending,
  onCancel,
  onConfirm,
}: {
  action: Action;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const copy = COPY[action];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-sm border border-ink/10 bg-white px-6 py-6 shadow-lg">
        <div>
          <h2 className="font-serif text-xl font-medium">{copy.title}</h2>
          <p className="mt-2 text-sm text-ink-soft">{copy.body}</p>
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
            {pending ? copy.pendingLabel : copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Shared confirm-and-act flow for both destructive ceremony actions, rendered
// either as a dashboard-card kebab menu or a "Danger zone" block. Both call
// the matching server action, which handles the actual delete/reset.
export function CeremonyDangerActions({
  ceremonyId,
  variant,
}: {
  ceremonyId: string;
  variant: "kebab" | "danger-zone";
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState<Action | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    const action = confirming;
    startTransition(async () => {
      if (action === "start-over") {
        await startOverCeremony(ceremonyId);
      } else if (action === "delete") {
        await deleteCeremony(ceremonyId);
      }
    });
  }

  return (
    <>
      {variant === "kebab" ? (
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="flex items-center gap-1.5 rounded-full border border-ink/25 bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-sm transition-colors hover:border-ink/50 hover:bg-parchment"
          >
            Manage
            <span aria-hidden className="text-sm leading-none">
              ▾
            </span>
          </button>
          {menuOpen ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-sm border border-ink/10 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(false);
                    setConfirming("start-over");
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-ink hover:bg-parchment"
                >
                  Start over
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(false);
                    setConfirming("delete");
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
        <div className="flex flex-col gap-5 rounded-sm border border-wine/30 bg-wine/5 px-6 py-6">
          <h2 className="text-lg font-medium text-wine">Danger zone</h2>

          <div className="flex flex-col gap-3 border-t border-wine/15 pt-4 first:border-t-0 first:pt-0">
            <div>
              <h3 className="text-sm font-medium">Start over</h3>
              <p className="mt-1 max-w-xl text-sm text-ink-soft">
                Clear your script, vows, timeline, vendor shortlist, budget, and witnesses —
                keeps your date, location, and other basic details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirming("start-over")}
              className="w-fit rounded-sm border border-ink/20 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-white"
            >
              Start over
            </button>
          </div>

          <div className="flex flex-col gap-3 border-t border-wine/15 pt-4">
            <div>
              <h3 className="text-sm font-medium text-wine">Delete ceremony</h3>
              <p className="mt-1 max-w-xl text-sm text-ink-soft">
                Permanently delete this ceremony and everything in it — script, vows, vendor
                shortlist, budget, witnesses, and certificate.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirming("delete")}
              className="w-fit rounded-sm border border-wine px-4 py-2 text-sm font-medium text-wine transition-colors hover:bg-wine hover:text-ivory"
            >
              Delete ceremony
            </button>
          </div>
        </div>
      )}

      {confirming ? (
        <ConfirmDialog
          action={confirming}
          pending={pending}
          onCancel={() => setConfirming(null)}
          onConfirm={confirm}
        />
      ) : null}
    </>
  );
}
