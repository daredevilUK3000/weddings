"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-8 px-6">
      <Link href="/" className="font-serif text-lg font-semibold tracking-tight">
        WeddingsForOne
      </Link>
      <div>
        <h1 className="font-serif text-3xl font-medium">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-soft">Sign in to keep planning your day.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-sm border border-ink/15 bg-white px-3 py-2.5 outline-none focus:border-rust"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-sm border border-ink/15 bg-white px-3 py-2.5 outline-none focus:border-rust"
        />
        {error ? <p className="text-sm text-rust">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm bg-ink px-3 py-3 font-medium text-paper transition-colors hover:bg-rust disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-ink-soft">
        No account yet?{" "}
        <Link href="/sign-up" className="font-medium text-ink underline underline-offset-2">
          Create one
        </Link>
      </p>
    </main>
  );
}
