import { ImageResponse } from "next/og";

export const alt = "Snap Me — apprends l'anglais avec tes photos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#201927",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <div
          style={{
            width: 140,
            height: 100,
            background: "#FF6B35",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#201927",
              display: "flex",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", position: "relative" }}>
          <span style={{ fontSize: 96, fontWeight: 700, color: "#f5f0f7" }}>
            Snap&nbsp;
          </span>
          <span style={{ fontSize: 96, fontWeight: 700, color: "#FF6B35" }}>
            Me
          </span>
          <div
            style={{
              position: "absolute",
              top: 6,
              right: -28,
              width: 22,
              height: 22,
              background: "#FBBF24",
              transform: "rotate(45deg)",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -18,
              right: -8,
              width: 11,
              height: 11,
              background: "#FBBF24",
              transform: "rotate(45deg)",
              display: "flex",
            }}
          />
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#9b8fac" }}>
          Apprends l&apos;anglais avec tes photos
        </div>
      </div>
    ),
    size
  );
}
