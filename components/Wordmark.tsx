import { Sparkle } from "@/components/Sparkle";

export function Wordmark({ className = "text-2xl" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-bold ${className}`}
      style={{
        fontFamily: "var(--font-display), var(--font-sans), Arial, sans-serif",
        letterSpacing: "-0.03em",
      }}
    >
      snapme
      <Sparkle className="ml-[0.06em] h-[0.55em] w-[0.55em] text-accent" />
    </span>
  );
}
