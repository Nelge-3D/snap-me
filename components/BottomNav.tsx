"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  { href: "/", label: "Accueil", icon: "📸" },
  { href: "/carnet", label: "Carnet", icon: "📖" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-sm">
        {TABS.map((tab) => {
          const isActive = tab.href === pathname;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-3 text-xs"
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 h-0.5 w-10 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`text-lg transition-opacity ${isActive ? "opacity-100" : "opacity-60"}`}
              >
                {tab.icon}
              </span>
              <span
                className={isActive ? "font-medium text-accent" : "text-muted"}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
