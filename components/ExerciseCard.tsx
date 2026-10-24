"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/types";

export function ExerciseCard({
  exercise,
  onCorrect,
}: {
  exercise: Exercise;
  onCorrect: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const isAnswered = selected !== null;
  const isCorrect = selected === exercise.answer;
  const [before, after] = exercise.prompt.split("____");

  function handleSelect(option: string) {
    if (isAnswered) return;
    setSelected(option);
    if (option === exercise.answer) onCorrect();
  }

  return (
    <div className="rounded-2xl bg-surface p-4">
      <p className="text-base">
        {before}
        <span className="text-accent">____</span>
        {after}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {exercise.options.map((option) => {
          const isThisCorrect = option === exercise.answer;
          const isThisSelected = option === selected;
          let style = "border-white/15 text-foreground";
          if (isAnswered && isThisCorrect) {
            style = "border-green-500 bg-green-500/15 text-green-400";
          } else if (isAnswered && isThisSelected) {
            style = "border-red-500 bg-red-500/15 text-red-400";
          }
          return (
            <button
              key={option}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelect(option)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-90 ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {isAnswered && (
        <p
          className={`mt-2 text-sm ${isCorrect ? "text-green-400" : "text-red-400"}`}
        >
          {isCorrect
            ? "+10 XP !"
            : `La bonne réponse était "${exercise.answer}".`}
        </p>
      )}
    </div>
  );
}
