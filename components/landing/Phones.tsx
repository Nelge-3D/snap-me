import { Sparkle } from "@/components/Sparkle";

function Phone({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="relative aspect-[9/18.5] w-[15.5rem] overflow-hidden font-sans rounded-[2.4rem] border-[6px] border-foreground bg-background shadow-2xl shadow-accent/20">
        <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-foreground" />
        <div className="flex h-full flex-col px-4 pb-4 pt-9">{children}</div>
      </div>
    </div>
  );
}

function Wordmark() {
  return (
    <span className="relative inline-block text-lg font-bold tracking-tight">
      Snap <span className="text-accent">Me</span>
      <Sparkle className="absolute -right-2.5 -top-1 h-2.5 w-2.5 rotate-12 text-amber-400" />
    </span>
  );
}

export function HomePhone({ className }: { className?: string }) {
  return (
    <Phone className={className}>
      <div className="flex items-center justify-between">
        <Wordmark />
        <span className="rounded-full bg-surface px-2 py-0.5 text-[0.65rem] font-medium text-accent">
          ⭐ 40 XP
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="flex w-full gap-1.5">
          {["Présent", "Passé", "Futur"].map((label, i) => (
            <span
              key={label}
              className={`flex-1 rounded-full border py-1 text-center text-[0.6rem] font-medium ${
                i === 0
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-muted/50 text-muted"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent text-4xl shadow-lg shadow-accent/40">
          📸
        </div>
        <p className="text-sm font-medium">Prendre une photo</p>
        <p className="text-[0.65rem] text-muted">1/5 photos aujourd&apos;hui</p>
      </div>
    </Phone>
  );
}

export function ResultPhone({ className }: { className?: string }) {
  return (
    <Phone className={className}>
      <div className="flex items-center justify-between">
        <Wordmark />
        <span className="rounded-full bg-surface px-2 py-0.5 text-[0.65rem] font-medium text-accent">
          ⭐ 50 XP
        </span>
      </div>
      <div className="mt-3 flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 via-orange-100 to-sky-100 text-7xl">
        🪑
      </div>
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-surface p-3">
        <div>
          <p className="text-[0.65rem] text-muted">chaise</p>
          <p className="text-2xl font-bold leading-tight text-accent">chair</p>
          <p className="text-[0.65rem] text-muted">/tʃɛər/</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-sm">
          🔊
        </span>
      </div>
      <div className="mt-2 space-y-1.5">
        {["This is a chair.", "The chair is yellow."].map((sentence) => (
          <p
            key={sentence}
            className="rounded-xl bg-surface px-3 py-2 text-[0.7rem]"
          >
            {sentence}
          </p>
        ))}
      </div>
    </Phone>
  );
}

export function ExercisePhone({ className }: { className?: string }) {
  return (
    <Phone className={className}>
      <div className="flex items-center justify-between">
        <Wordmark />
        <span className="rounded-full bg-surface px-2 py-0.5 text-[0.65rem] font-medium text-accent">
          ⭐ 60 XP
        </span>
      </div>
      <p className="mt-5 text-[0.65rem] font-medium uppercase tracking-wide text-muted">
        Exercice 1/3
      </p>
      <p className="mt-1 text-base font-bold">Complète la phrase</p>
      <div className="mt-3 rounded-2xl bg-surface p-3 text-sm">
        This is a{" "}
        <span className="inline-block min-w-12 border-b-2 border-accent text-center font-semibold text-accent">
          chair
        </span>
        .
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          { label: "chair", ok: true },
          { label: "window", ok: false },
          { label: "plant", ok: false },
        ].map((option) => (
          <p
            key={option.label}
            className={`rounded-xl border px-3 py-2 text-xs ${
              option.ok
                ? "border-emerald-400 bg-emerald-50 font-semibold text-emerald-700"
                : "border-surface-border text-muted"
            }`}
          >
            {option.label}
          </p>
        ))}
      </div>
      <p className="mt-auto rounded-full bg-accent py-2 text-center text-xs font-semibold text-accent-foreground">
        Bravo ! +10 XP
      </p>
    </Phone>
  );
}
