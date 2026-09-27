"use client";

import * as React from "react";

type Props = { campaignId: string; path?: string; children: React.ReactNode };

async function send(type: "IMPRESSION" | "CLICK", campaignId: string, path?: string) {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, campaignId, path }),
      keepalive: true,
    });
  } catch {
    // Analytics must never block the billboard experience.
  }
}

export function BillboardTracker({ campaignId, path, children }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const key = `sb_impression_${campaignId}`;
    if (window.sessionStorage.getItem(key)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      window.sessionStorage.setItem(key, "1");
      void send("IMPRESSION", campaignId, path);
      observer.disconnect();
    }, { threshold: 0.5 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [campaignId, path]);

  return (
    <div ref={ref} onClick={() => void send("CLICK", campaignId, path)}>
      {children}
    </div>
  );
}
