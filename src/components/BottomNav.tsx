"use client";

import Link from "next/link";

type Page = "scan" | "historico" | "profile";

const navItems: { page: Page; label: string; href: string }[] = [
  { page: "scan", label: "Scan", href: "/" },
  { page: "historico", label: "Histórico", href: "/historico" },
  { page: "profile", label: "Perfil", href: "/dashboard" },
];

export default function BottomNav({ currentPage }: { currentPage: Page }) {
  return (
    <nav className="flex border-t border-gray-200 bg-gray-50">
      {navItems.map((item) => (
        <Link
          key={item.page}
          href={item.href}
          className={`flex flex-1 flex-col items-center gap-1 pb-3 pt-2.5 text-[11px] font-medium transition-colors ${
            currentPage === item.page ? "text-primary" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {item.page === "scan" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          )}
          {item.page === "historico" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )}
          {item.page === "profile" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
