"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  BookOpen,
  ClipboardCheck,
  HardHat,
  House,
  MessageSquareWarning,
} from "lucide-react";
import { TstSignOut } from "@/components/tst-sign-out";
import { authClient } from "@/lib/auth-client";

const links = [
  { href: "/home", label: "Feed", icon: House },
  { href: "/checklist", label: "Checklist", icon: ClipboardCheck },
  { href: "/solicitar-epi", label: "Solicitar EPI", icon: HardHat },
  {
    href: "/denuncia",
    label: "Canal de denúncias",
    icon: MessageSquareWarning,
  },
  { href: "/treinamentos", label: "Treinamentos", icon: BookOpen },
];

export function IrisLogo({ compact = false }: { compact?: boolean }) {
  return <span className={`inline-flex flex-col items-center justify-center leading-none ${compact ? "gap-0.5" : "gap-1"}`}>
    <span className={`overflow-hidden ${compact ? "h-10 w-12" : "h-10 w-12 sm:h-14 sm:w-16"}`} aria-hidden="true"><Image src="/iris-logo.jpeg" alt="" width={359} height={498} unoptimized className="h-auto w-full object-cover object-top" /></span>
    <strong className={`${compact ? "text-[11px]" : "text-[11px] sm:text-sm"} font-extrabold tracking-[.08em] text-[#0e5b46]`}>IRIS</strong>
    <span className={`${compact ? "text-[6px]" : "text-[6px] sm:text-[7px]"} whitespace-nowrap font-medium tracking-[.01em] text-[#176f57]`}>Comunicação Digital e SST</span>
  </span>;
}

export function SiteHeader({
  activeHref,
}: { activeHref?: string | null } = {}) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const selectedHref = activeHref === undefined ? pathname : activeHref;
  if (pathname === "/tst" || pathname.startsWith("/tst/")) return null;
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link
          href="/home"
          className="brand"
          aria-label="Iris — página inicial"
        >
          <IrisLogo />
        </Link>
        <nav className="top-links" aria-label="Navegação principal">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`top-link${href === selectedHref ? " active" : ""}`}
              aria-current={href === selectedHref ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        {isPending ? (
          <span className="header-auth-placeholder" aria-hidden="true" />
        ) : session?.user ? (
          <div className="header-auth-actions">
            <Link className="enter-link mr-2.5" href="/tst">
              Painel
            </Link>
            <TstSignOut />
          </div>
        ) : (
          <Link
            className="enter-link"
            href="/login"
            aria-current={pathname === "/login" ? "page" : undefined}
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}

export function MobileDock() {
  const pathname = usePathname();
  const dock = [
    { href: "/home", label: "Feed", icon: House },
    { href: "/checklist", label: "Checklist", icon: ClipboardCheck },
    { href: "/solicitar-epi", label: "EPI", icon: HardHat },
    { href: "/denuncia", label: "Denúncia", icon: MessageSquareWarning },
    { href: "/treinamentos", label: "Aprender", icon: BookOpen },
  ];
  return (
    <nav className="mobile-dock" aria-label="Navegação mobile">
      {dock.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`dock-item${href === pathname ? " active" : ""}`}
          aria-current={href === pathname ? "page" : undefined}
        >
          <Icon strokeWidth={1.9} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
