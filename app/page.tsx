import type { Metadata } from "next";
import Link from "next/link";
import { Sparkle } from "@/components/Sparkle";
import {
  ExercisePhone,
  HomePhone,
  ResultPhone,
} from "@/components/landing/Phones";

export const metadata: Metadata = {
  title: "Snap Me - apprends l'anglais avec ce que tu vois",
  description:
    "Photographie un objet autour de toi, découvre son nom en anglais, écoute-le prononcer et progresse du présent au futur. Bientôt disponible.",
};

const NAV = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#comment", label: "Comment ça marche" },
  { href: "#demo", label: "Démo" },
  { href: "#faq", label: "FAQ" },
];

const FEATURES = [
  {
    icon: "📸",
    title: "Prends des photos",
    text: "Photographie les objets qui t'entourent dans ta vie quotidienne.",
  },
  {
    icon: "🔊",
    title: "Écoute la prononciation",
    text: "Chaque mot vient avec son IPA et une voix qui le prononce, directement dans ton navigateur.",
  },
  {
    icon: "📈",
    title: "Progresse en grammaire",
    text: "Gagne de l'XP et débloque peu à peu le passé puis le futur.",
  },
];

const STEPS = [
  {
    title: "Photographie ton environnement",
    text: "Une chaise, un mug, une plante : prends en photo ce qui est autour de toi, à la maison ou en ville.",
  },
  {
    title: "L'IA identifie l'objet",
    text: "Snap Me reconnaît l'objet et te donne le mot anglais, sa prononciation et des phrases d'exemple.",
  },
  {
    title: "Complète des exercices",
    text: "Des exercices à trous fixent le vocabulaire, et ton XP débloque de nouveaux temps.",
  },
];

const FAQ = [
  {
    q: "Faut-il créer un compte ?",
    a: "Non. Snap Me n'a pas de compte ni de base de données : ton carnet est gardé sur ton appareil, dans ton navigateur.",
  },
  {
    q: "Quelle technologie est derrière ?",
    a: "Gemma 4, le modèle ouvert de Google, reconnaît les objets et écrit les phrases. La voix vient de Kokoro-82M, qui tourne entièrement dans ton navigateur.",
  },
  {
    q: "Sur quels appareils ça marche ?",
    a: "Sur le navigateur de ton téléphone ou de ton ordinateur. Rien à installer.",
  },
  {
    q: "Est-ce gratuit ?",
    a: "La démo est gratuite, avec une limite de 5 photos par jour pour garder le service ouvert à tous.",
  },
  {
    q: "Qui a créé Snap Me ?",
    a: "Louis-Gériel Ngabi (Nelge 3D), développeur web, artiste 3D et professeur d'anglais à Libreville, pour le Hacktoberfest Hack Day Libreville 2026.",
  },
];

const BUTTON_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/30 transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const BUTTON_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-full border border-accent px-6 py-3 text-sm font-semibold text-accent transition hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function Wordmark({ className = "text-2xl" }: { className?: string }) {
  return (
    <span
      className={`relative inline-block font-bold tracking-tight ${className}`}
    >
      Snap <span className="text-accent">Me</span>
      <Sparkle className="absolute -right-3.5 -top-1.5 h-3.5 w-3.5 rotate-12 text-amber-400" />
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="flex-1 overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-surface-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" aria-label="Snap Me, accueil">
            <Wordmark />
          </Link>
          <nav aria-label="Navigation principale" className="hidden gap-8 text-sm md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-muted transition hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Link href="/app" className={`${BUTTON_PRIMARY} !px-5 !py-2`}>
            Essayer la démo
          </Link>
        </div>
      </header>

      <main>
        <section className="relative bg-gradient-to-b from-orange-50 via-background to-background">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-2 lg:pt-20">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                <Sparkle className="h-3 w-3 text-amber-500" />
                Bientôt disponible
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Apprends l&apos;anglais{" "}
                <span className="text-accent">avec ce que tu vois.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted">
                Photographie ce qui t&apos;entoure au quotidien, découvre le
                mot en anglais, écoute-le prononcer et progresse du présent au
                passé, puis au futur.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/app" className={BUTTON_PRIMARY}>
                  Découvrir la démo <span aria-hidden="true">→</span>
                </Link>
                <a href="#comment" className={BUTTON_SECONDARY}>
                  Comment ça marche
                </a>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                {["Simple et ludique", "Basé sur la vie réelle", "Sans compte"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <span aria-hidden="true" className="text-accent">
                        ✓
                      </span>
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="relative flex justify-center py-4">
              <HomePhone className="absolute -left-2 top-10 hidden -rotate-6 scale-90 opacity-95 md:block lg:-left-6" />
              <ExercisePhone className="absolute -right-2 top-10 hidden rotate-6 scale-90 opacity-95 md:block lg:-right-6" />
              <ResultPhone className="relative z-10 scale-105" />
            </div>
          </div>
        </section>

        <section
          id="fonctionnalites"
          className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16"
        >
          <div className="grid gap-5 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-surface-border bg-white/70 p-6 shadow-sm"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-3xl">
                  {feature.icon}
                </span>
                <h2 className="mt-4 text-lg font-bold">{feature.title}</h2>
                <p className="mt-1.5 text-sm text-muted">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="comment"
          className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-16"
        >
          <div className="rounded-[2rem] bg-surface px-6 py-12 sm:px-10">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-accent">
              Comment ça marche ?
            </p>
            <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight">
              3 étapes pour apprendre naturellement
            </h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="demo"
          className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-16"
        >
          <div className="grid items-center gap-8 rounded-[2rem] bg-gradient-to-br from-amber-50 to-orange-100 px-6 py-12 sm:px-10 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                Démo
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
                Découvre la démo de Snap Me
              </h2>
              <p className="mt-3 text-muted">
                Essaie avec un vrai objet autour de toi : photo, mot anglais,
                prononciation et exercice, en moins d&apos;une minute.
              </p>
              <Link href="/app" className={`${BUTTON_PRIMARY} mt-6`}>
                Voir la démo <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="rounded-3xl bg-white/80 p-6 shadow-sm">
              <p className="text-lg font-semibold leading-snug">
                Pensé pour un apprentissage concret et quotidien : l&apos;anglais
                utile, visuel et motivant.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {[
                  "Gratuit, sans compte à créer",
                  "Ton carnet reste sur ton appareil",
                  "Voix générée dans ton navigateur",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-accent">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="mx-auto max-w-3xl scroll-mt-20 px-5 pb-16"
        >
          <h2 className="text-center text-3xl font-extrabold tracking-tight">
            Questions fréquentes
          </h2>
          <div className="mt-8 divide-y divide-surface-border rounded-3xl border border-surface-border bg-white/70">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="text-xl text-accent transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-5 pb-20 text-center">
          <Wordmark className="text-4xl" />
          <p className="mt-3 text-lg font-semibold">Snap Me arrive bientôt.</p>
          <p className="mx-auto mt-1 max-w-md text-muted">
            En attendant, la démo est ouverte : essaie-la dès maintenant.
          </p>
          <Link href="/app" className={`${BUTTON_PRIMARY} mt-6`}>
            Essayer la démo <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>

      <footer className="border-t border-surface-border px-5 py-8 text-center text-sm text-muted">
        <p>
          Fait à Libreville pour le Hacktoberfest Hack Day 2026, avec Gemma 4 et
          Kokoro-82M.
        </p>
        <p className="mt-1">
          <a
            href="https://github.com/Nelge-3D/snap-me"
            className="font-medium text-accent hover:underline"
          >
            Code source sur GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
