"use client";

import { useRef, useState } from "react";
import type { SignatureType } from "@/lib/types/database";

const WIDTH = 300;
const HEIGHT = 100;

export function SignaturePad({
  onSubmit,
  submitting,
}: {
  onSubmit: (signatureType: SignatureType, signatureData: string) => void;
  submitting: boolean;
}) {
  const [mode, setMode] = useState<SignatureType>("typed");
  const [typedName, setTypedName] = useState("");
  const [consent, setConsent] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const currentPath = useRef("");
  const pathsRef = useRef<string[]>([]);

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const { x, y } = pointerPos(e);
    currentPath.current = `M${x.toFixed(1)},${y.toFixed(1)}`;
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const { x, y } = pointerPos(e);
    currentPath.current += ` L${x.toFixed(1)},${y.toFixed(1)}`;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = "#20201D";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  function handlePointerUp() {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentPath.current) {
      pathsRef.current.push(currentPath.current);
      setHasDrawing(true);
    }
    currentPath.current = "";
  }

  function clearCanvas() {
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, WIDTH, HEIGHT);
    pathsRef.current = [];
    setHasDrawing(false);
  }

  function handleSubmit() {
    if (!consent) return;
    if (mode === "typed") {
      if (!typedName.trim()) return;
      onSubmit("typed", typedName.trim());
    } else if (pathsRef.current.length > 0) {
      onSubmit(
        "drawn",
        JSON.stringify({ viewBox: `0 0 ${WIDTH} ${HEIGHT}`, paths: pathsRef.current }),
      );
    }
  }

  const canSubmit = consent && (mode === "typed" ? typedName.trim().length > 0 : hasDrawing);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("typed")}
          className={`rounded-sm border px-3 py-1.5 transition-colors ${
            mode === "typed" ? "border-champagne bg-parchment/60" : "border-ink/15"
          }`}
        >
          Type
        </button>
        <button
          type="button"
          onClick={() => setMode("drawn")}
          className={`rounded-sm border px-3 py-1.5 transition-colors ${
            mode === "drawn" ? "border-champagne bg-parchment/60" : "border-ink/15"
          }`}
        >
          Draw
        </button>
      </div>

      {mode === "typed" ? (
        <input
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          placeholder="Your name"
          className="rounded-sm border border-ink/15 bg-white px-3 py-3 font-serif text-2xl italic outline-none focus:border-champagne"
        />
      ) : (
        <div className="flex flex-col gap-2">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="touch-none rounded-sm border border-ink/15 bg-white"
          />
          <button
            type="button"
            onClick={clearCanvas}
            className="w-fit text-xs text-ink-soft underline underline-offset-2"
          >
            Clear
          </button>
        </div>
      )}

      <label className="flex items-start gap-2 text-xs text-ink-soft">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        I understand this is a ceremonial signature, not a legal attestation.
      </label>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-fit rounded-sm bg-ink px-4 py-2 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine disabled:opacity-50"
      >
        {submitting ? "Signing…" : "Sign Certificate"}
      </button>
    </div>
  );
}
