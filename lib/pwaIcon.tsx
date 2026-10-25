import { ImageResponse } from "next/og";

export function renderAppIcon(px: number) {
  const u = px / 100;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#201927",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 52 * u,
            height: 36 * u,
            background: "#FF6B35",
            borderRadius: 8 * u,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 20 * u,
              height: 20 * u,
              borderRadius: "50%",
              background: "#201927",
              display: "flex",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 24 * u,
            right: 24 * u,
            width: 11 * u,
            height: 11 * u,
            background: "#FBBF24",
            transform: "rotate(45deg)",
            display: "flex",
          }}
        />
      </div>
    ),
    { width: px, height: px },
  );
}
