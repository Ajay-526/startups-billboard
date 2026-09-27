"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ParticleButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const [active, setActive] = React.useState(false);

  return (
    <Button
      size="lg"
      onClick={() => {
        setActive(true);
        onClick?.();
        window.setTimeout(() => setActive(false), 500);
      }}
      className="relative overflow-hidden"
    >
      <span className="relative z-10 flex items-center gap-2">
        <Sparkles size={15} />
        {children}
      </span>
      {active && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-white/20" />}
    </Button>
  );
}
