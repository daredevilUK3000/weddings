"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export function OfficiantChat({ ceremonyId }: { ceremonyId: string }) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/officiant-chat",
      body: { ceremonyId },
    }),
  });

  async function handleGenerate() {
    setGenerating(true);
    const transcript = messages
      .map((m) => {
        const text = m.parts
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join(" ");
        return `${m.role === "user" ? "Client" : "Officiant"}: ${text}`;
      })
      .join("\n");

    const res = await fetch("/api/ai/ceremony-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ceremonyId, interviewTranscript: transcript }),
    });

    setGenerating(false);
    if (res.ok) {
      router.push(`/ceremonies/${ceremonyId}/builder`);
    }
  }

  const waitingOnOfficiant = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto rounded-sm border border-ink/10 bg-white/60 p-5">
        {messages.length === 0 ? (
          <p className="font-serif text-lg italic text-ink-soft">
            Say hello to begin — your officiant will ask a few questions to shape your ceremony
            script and vows.
          </p>
        ) : null}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "self-end text-right" : "self-start"}>
            <p
              className={`inline-block max-w-md rounded-lg px-4 py-2.5 text-[15px] leading-relaxed ${
                m.role === "user"
                  ? "bg-ink text-paper"
                  : "border border-gold/40 bg-paper font-serif text-ink"
              }`}
            >
              {m.parts
                .filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p) => p.text)
                .join("")}
            </p>
          </div>
        ))}
        {waitingOnOfficiant ? (
          <div className="self-start">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-paper px-4 py-2.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rust [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rust [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rust" />
            </span>
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput("");
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "ready"}
          placeholder="Type your answer…"
          className="flex-1 rounded-sm border border-ink/15 bg-white px-3 py-2.5 outline-none focus:border-rust disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status !== "ready"}
          className="rounded-sm bg-ink px-4 py-2.5 font-medium text-paper transition-colors hover:bg-rust disabled:opacity-50"
        >
          Send
        </button>
      </form>

      {messages.length >= 6 ? (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-sm border border-rust px-4 py-3 font-medium text-rust transition-colors hover:bg-rust hover:text-paper disabled:opacity-50"
        >
          {generating ? "Drafting your ceremony…" : "I'm ready — draft my ceremony & vows"}
        </button>
      ) : null}
    </div>
  );
}
