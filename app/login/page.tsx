"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setError(payload?.error ?? "Unable to sign in.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="site-shell py-16">
      <p className="eyebrow text-[var(--signal)]">ADVERTISER ACCESS</p>
      <h1 className="display-sm mt-3 max-w-3xl">Sign in.</h1>
      <p className="mt-4 max-w-xl text-sm text-white/45">Manage campaigns, creatives and billboard inventory from your console.</p>
      <form onSubmit={onSubmit} className="mt-10 max-w-md space-y-4 rounded-[28px] border border-white/10 bg-white/[.025] p-6">
        <label className="block text-xs font-semibold uppercase tracking-[.14em] text-white/40">
          Email
          <input name="email" type="email" required className="mt-2 h-11 w-full rounded-full border border-white/10 bg-black/30 px-4 text-sm text-white" />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[.14em] text-white/40">
          Password
          <input name="password" type="password" required className="mt-2 h-11 w-full rounded-full border border-white/10 bg-black/30 px-4 text-sm text-white" />
        </label>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full">{pending ? "Signing in..." : "Sign in"}</Button>
        <p className="text-center text-xs text-white/40">
          New advertiser? <Link href="/register" className="text-[var(--signal)]">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
