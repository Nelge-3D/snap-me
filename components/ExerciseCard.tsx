"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      <motion.div
        className="mt-3 flex flex-wrap gap-2"
        animate={
          isAnswered && !isCorrect ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }
        }
        transition={{ duration: 0.4 }}
      >
        {exercise.options.map((option) => {
          const isThisCorrect = option === exercise.answer;
          const isThisSelected = option === selected;
          let style = "border-surface-border text-foreground";
          if (isAnswered && isThisCorrect) {
            style = "border-green-500 bg-green-500/15 text-green-400";
          } else if (isAnswered && isThisSelected) {
            style = "border-red-500 bg-red-500/15 text-red-400";
          }
          return (
            <motion.button
              key={option}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelect(option)}
              whileTap={!isAnswered ? { scale: 0.92 } : undefined}
              animate={isThisCorrect && isAnswered ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-90 ${style}`}
            >
              {option}
            </motion.button>
          );
        })}
      </motion.div>
      <AnimatePresence>
        {isAnswered && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            transition={{ duration: 0.25 }}
            className={`mt-2 text-sm ${isCorrect ? "text-green-400" : "text-red-400"}`}
          >
            {isCorrect
              ? "+10 XP !"
              : `La bonne réponse était "${exercise.answer}".`}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
