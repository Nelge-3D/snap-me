"use client";

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
            className={`flex-1 rounded-full border px-2 py-2 text-xs font-medium transition-colors ${
              isSelected
                ? "border-accent bg-accent text-accent-foreground"
                : unlocked
                  ? "border-white/15 text-foreground active:bg-white/5"
                  : "border-white/10 text-muted"
            }`}
          >
            {unlocked ? label : `🔒 ${LEVEL_THRESHOLDS[value]} XP`}
          </button>
        );
      })}
    </div>
  );
}
