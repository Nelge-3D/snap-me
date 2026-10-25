import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";

export const alt = "Snap Me - apprends l'anglais avec ce que tu vois";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ORANGE = "#FF6B35";
const INK = "#201927";
const MUTED = "#786e8a";
const DISPLAY = "Space Grotesk";
const BODY = "Manrope";

function Sparkle({ px, color = ORANGE }: { px: number; color?: string }) {
  return (
    <svg width={px} height={px} viewBox="0 0 24 24">
      <path
        d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"
        fill={color}
      />
    </svg>
  );
}

function Wordmark({ fontSize }: { fontSize: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end" }}>
      <span
        style={{
          fontFamily: DISPLAY,
          fontSize,
          fontWeight: 700,
          letterSpacing: -fontSize * 0.03,
          color: INK,
        }}
      >
        snapme
      </span>
      <div
        style={{
          display: "flex",
          marginLeft: fontSize * 0.06,
          marginBottom: fontSize * 0.2,
        }}
      >
        <Sparkle px={Math.round(fontSize * 0.55)} />
      </div>
    </div>
  );
}

async function loadFonts() {
  "use cache";
  cacheLife("max");
  const dir = join(process.cwd(), "assets", "fonts");
  const [display, body] = await Promise.all([
    readFile(join(dir, "SpaceGrotesk-Bold.ttf")),
    readFile(join(dir, "Manrope-Medium.ttf")),
  ]);
  return { display: new Uint8Array(display), body: new Uint8Array(body) };
}

export default async function OgImage() {
  const { display, body } = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          fontFamily: BODY,
          background:
            "linear-gradient(135deg, #fff1e6 0%, #fbf9fc 55%, #fff7e0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 680 }}>
          <Wordmark fontSize={64} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 30,
              fontFamily: DISPLAY,
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -2,
              color: INK,
            }}
          >
            <span>Apprends l&apos;anglais</span>
            <span style={{ color: ORANGE }}>avec ce que tu vois.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 28,
              fontWeight: 500,
              lineHeight: 1.4,
              color: MUTED,
            }}
          >
            Photographie un objet, découvre son mot en anglais, écoute-le
            prononcer.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 34,
              fontSize: 22,
              fontWeight: 500,
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
            <Wordmark fontSize={26} />
            <div
              style={{
                display: "flex",
                padding: "4px 12px",
                borderRadius: 20,
                background: "#f1edf5",
                fontSize: 16,
                fontWeight: 500,
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
                    fontWeight: 500,
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
              <Sparkle px={78} color="#ffffff" />
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 20,
                fontWeight: 500,
                color: INK,
              }}
            >
              Prendre une photo
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: DISPLAY, data: display.buffer as ArrayBuffer, weight: 700, style: "normal" },
        { name: BODY, data: body.buffer as ArrayBuffer, weight: 500, style: "normal" },
      ],
    },
  );
}
