import { ImageResponse } from "next/og";

const SPARKLE =
  "M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z";

export function renderAppIcon(px: number, cornerRadius = 0) {
  const big = Math.round(px * 0.64);
  const small = Math.round(px * 0.24);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#201927",
          borderRadius: cornerRadius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", marginRight: Math.round(px * 0.05) }}>
          <svg width={big} height={big} viewBox="0 0 24 24">
            <path d={SPARKLE} fill="#FF6B35" />
          </svg>
        </div>
        <div
          style={{
            position: "absolute",
            top: Math.round(px * 0.2),
            right: Math.round(px * 0.2),
            display: "flex",
          }}
        >
          <svg width={small} height={small} viewBox="0 0 24 24">
            <path d={SPARKLE} fill="#FBBF24" />
          </svg>
        </div>
      </div>
    ),
    { width: px, height: px },
  );
}
