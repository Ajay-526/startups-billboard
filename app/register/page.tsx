"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setError(payload?.error ?? "Unable to create account.");
      return;
    }
    router.push("/advertise");
    router.refresh();
  }

  return (
    <section className="site-shell py-16">
      <p className="eyebrow text-[var(--signal)]">JOIN THE BOARD</p>
      <h1 className="display-sm mt-3 max-w-3xl">Create your advertiser account.</h1>
      <p className="mt-4 max-w-xl text-sm text-white/45">Passwords must be at least 12 characters.</p>
      <form onSubmit={onSubmit} className="mt-10 max-w-md space-y-4 rounded-[28px] border border-white/10 bg-white/[.025] p-6">
        <label className="block text-xs font-semibold uppercase tracking-[.14em] text-white/40">
          Name
          <input name="name" required minLength={2} className="mt-2 h-11 w-full rounded-full border border-white/10 bg-black/30 px-4 text-sm text-white" />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[.14em] text-white/40">
          Email
          <input name="email" type="email" required className="mt-2 h-11 w-full rounded-full border border-white/10 bg-black/30 px-4 text-sm text-white" />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[.14em] text-white/40">
          Password
          <input name="password" type="password" required minLength={12} className="mt-2 h-11 w-full rounded-full border border-white/10 bg-black/30 px-4 text-sm text-white" />
        </label>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full">{pending ? "Creating..." : "Create account"}</Button>
        <p className="text-center text-xs text-white/40">
          Already have an account? <Link href="/login" className="text-[var(--signal)]">Sign in</Link>
        </p>
      </form>
    </section>
  );
}
