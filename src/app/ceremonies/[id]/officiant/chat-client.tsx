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

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-md border border-black/10 p-4">
        {messages.length === 0 ? (
          <p className="text-black/50">
            Say hello to begin — your officiant will ask a few questions to shape your
            ceremony script and vows.
          </p>
        ) : null}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "self-end text-right" : "self-start"}>
            <p
              className={`inline-block max-w-md rounded-lg px-3 py-2 ${
                m.role === "user" ? "bg-black text-white" : "bg-black/5"
              }`}
            >
              {m.parts
                .filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p) => p.text)
                .join("")}
            </p>
          </div>
        ))}
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
          className="flex-1 rounded-md border border-black/10 px-3 py-2"
        />
        <button
          type="submit"
          disabled={status !== "ready"}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>

      {messages.length >= 6 ? (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-md border border-black px-4 py-3 disabled:opacity-50"
        >
          {generating ? "Drafting your ceremony…" : "I'm ready — draft my ceremony & vows"}
        </button>
      ) : null}
    </div>
  );
}
