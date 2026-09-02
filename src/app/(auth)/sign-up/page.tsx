"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-4 px-6 text-center">
        <div className="mx-auto mb-2 h-px w-10 bg-gold" />
        <h1 className="font-serif text-3xl font-medium">Check your email</h1>
        <p className="text-ink-soft">
          We sent a confirmation link to {email}. Follow it to finish setting up your account.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-8 px-6">
      <Link href="/" className="font-serif text-lg font-semibold tracking-tight">
        WeddingsForOne
      </Link>
      <div>
        <h1 className="font-serif text-3xl font-medium">Start planning</h1>
        <p className="mt-1 text-sm text-ink-soft">A ceremony of one, built around you.</p>
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
          minLength={6}
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </main>
  );
}
