import { ImageResponse } from "next/og";

export const alt = "Snap Me - apprends l'anglais avec ce que tu vois";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ORANGE = "#FF6B35";
const INK = "#201927";
const MUTED = "#786e8a";
const AMBER = "#FBBF24";

function Sparkle({ px }: { px: number }) {
  return (
    <svg width={px} height={px} viewBox="0 0 24 24">
      <path
        d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"
        fill={AMBER}
      />
    </svg>
  );
}

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #fff1e6 0%, #fbf9fc 55%, #fff7e0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 680 }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <span style={{ fontSize: 64, color: INK, WebkitTextStroke: `2px ${INK}` }}>
              Snap&nbsp;
            </span>
            <span style={{ fontSize: 64, color: ORANGE, WebkitTextStroke: `2px ${ORANGE}` }}>
              Me
            </span>
            <div style={{ display: "flex", marginLeft: 6, marginTop: -6 }}>
              <Sparkle px={30} />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 28,
              fontSize: 66,
              lineHeight: 1.1,
              color: INK,
              WebkitTextStroke: `2px ${INK}`,
            }}
          >
            <span>Apprends l&apos;anglais</span>
            <span style={{ color: ORANGE, WebkitTextStroke: `2px ${ORANGE}` }}>
              avec ce que tu vois.
            </span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 28,
              lineHeight: 1.35,
              color: MUTED,
            }}
          >
            Photographie un objet, découvre son mot en anglais, écoute-le
            prononcer.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 22,
              color: MUTED,
            }}
          >
            Gemma 4 + Kokoro-82M · Hackathon Libreville 2026
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 300,
            height: 520,
            background: "#fbf9fc",
            border: `10px solid ${INK}`,
            borderRadius: 54,
            padding: "40px 22px 22px",
            transform: "rotate(4deg)",
            boxShadow: "0 30px 60px rgba(255,107,53,0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700 }}>
              <span style={{ color: INK }}>Snap&nbsp;</span>
              <span style={{ color: ORANGE }}>Me</span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "4px 12px",
                borderRadius: 20,
                background: "#f1edf5",
                fontSize: 16,
                color: ORANGE,
              }}
            >
              40 XP
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", marginBottom: 28 }}>
              {["Présent", "Passé", "Futur"].map((label, i) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    padding: "6px 12px",
                    margin: "0 4px",
                    borderRadius: 20,
                    fontSize: 15,
                    background: i === 0 ? ORANGE : "transparent",
                    border: `2px solid ${i === 0 ? ORANGE : "#cfc7da"}`,
                    color: i === 0 ? "#ffffff" : MUTED,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 150,
                height: 150,
                borderRadius: 75,
                background: ORANGE,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 84,
                  height: 58,
                  borderRadius: 14,
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    background: ORANGE,
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 20, color: INK }}>
              Prendre une photo
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
