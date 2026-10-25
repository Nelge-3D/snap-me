"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wordmark } from "@/components/Wordmark";

const STORAGE_KEY = "snapme:onboarded";

const STEPS = [
  { icon: "📸", text: "Prends une photo d'un objet autour de toi" },
  { icon: "🔤", text: "Découvre son nom en anglais, avec la prononciation" },
  { icon: "📝", text: "Entraîne-toi avec des phrases et des exercices" },
];

// Pas de vrai "store" à écouter ici (c'est un indicateur one-shot) : on se
// sert de useSyncExternalStore uniquement pour lire le localStorage sans
// provoquer de décalage d'hydratation entre le rendu serveur et le client.
function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  try {
    return !window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

export function Onboarding() {
  const neverOnboarded = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [dismissed, setDismissed] = useState(false);
  const visible = neverOnboarded && !dismissed;

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Tant pis, l'écran réapparaîtra au prochain chargement.
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
        >
          <motion.div
            className="w-full max-w-sm rounded-3xl bg-surface p-6"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold">
              Bienvenue sur <Wordmark className="" /> 👋
            </h2>
            <p className="mt-1 text-sm text-muted">
              Apprends l&apos;anglais à partir de ce qui t&apos;entoure.
            </p>

            <div className="mt-5 flex flex-col gap-4">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.text}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                >
                  <span className="text-2xl">{step.icon}</span>
                  <p className="text-sm">{step.text}</p>
                </motion.div>
              ))}
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-accent font-medium text-accent-foreground transition-transform active:scale-95"
            >
              C&apos;est parti !
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
