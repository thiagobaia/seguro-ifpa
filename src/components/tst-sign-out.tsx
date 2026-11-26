"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

export function TstSignOut({ className = "", icon, variant = "default", iconOnly = false, ariaLabel = "Sair" }: { className?: string; icon?: ReactNode; variant?: "default" | "dock"; iconOnly?: boolean; ariaLabel?: string }) {
  const router = useRouter();
  const layoutClasses = variant === "dock"
    ? "grid min-h-14 grid-rows-[1fr_auto] justify-items-center gap-1 rounded-lg px-1 py-1 text-[10px]"
    : iconOnly
      ? "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg bg-emerald-700 p-2 text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
    : "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

  return (
    <button
      className={`${className} ${layoutClasses}`}
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      {icon}
      {!iconOnly && (icon ? <span>Sair</span> : "Sair")}
    </button>
  );
}
