"use client";

import { motion } from "framer-motion";
import type { Level } from "@/lib/types";
import { LEVEL_THRESHOLDS, isLevelUnlocked, setLevel } from "@/lib/storage";

const LEVELS: { value: Level; label: string }[] = [
  { value: "present", label: "Présent" },
  { value: "past", label: "Passé" },
  { value: "future", label: "Futur" },
];

export function LevelSelector({
  current,
  xp,
}: {
  current: Level;
  xp: number;
}) {
  return (
    <div className="flex w-full gap-2">
      {LEVELS.map(({ value, label }) => {
        const unlocked = isLevelUnlocked(value, xp);
        const isSelected = value === current;
        return (
          <button
            key={value}
            type="button"
            disabled={!unlocked}
            onClick={() => setLevel(value)}
            className={`relative flex-1 overflow-hidden rounded-full border px-2 py-2 text-xs font-medium transition-colors ${
              isSelected
                ? "border-accent text-accent-foreground"
                : unlocked
                  ? "border-surface-border text-foreground active:bg-black/5"
                  : "border-surface-border text-muted"
            }`}
          >
            {isSelected && (
              <motion.span
                layoutId="level-pill"
                className="absolute inset-0 bg-accent"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {unlocked ? label : `🔒 ${LEVEL_THRESHOLDS[value]} XP`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
