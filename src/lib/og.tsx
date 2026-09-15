import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ogSize = { width: 1200, height: 630 };

const fonts = Promise.all([
  readFile(join(process.cwd(), "src/assets/BricolageGrotesque-Bold.ttf")),
  readFile(join(process.cwd(), "src/assets/InstrumentSans-Regular.ttf")),
]);

const ORANGE = "#ff5f00";
const FG = "#ece8e1";
const MUTED = "#9c968d";

export async function renderOg({ title, detail, meta }: { title: string; detail?: string; meta?: [string, string?] }) {
  const [bricolage, instrument] = await fonts;
  const titleSize = title.length <= 12 ? 150 : title.length <= 36 ? 92 : title.length <= 70 ? 72 : 58;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000",
          color: FG,
          padding: "64px 72px",
          fontFamily: "Instrument Sans",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill={ORANGE}>
            <rect x="3" y="1" width="6" height="11" rx="1" />
            <rect x="3" y="13" width="6" height="10" rx="1" />
            <path d="M11 7h7a3 3 0 0 1 3 3v2a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
            <rect x="15" y="14" width="6" height="9" rx="1" />
          </svg>
          <span style={{ fontFamily: "Bricolage Grotesque", fontSize: 36, letterSpacing: -1 }}>hands on</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontFamily: "Bricolage Grotesque",
              fontSize: titleSize,
              lineHeight: 1.02,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {detail && (
            <div style={{ fontSize: 30, lineHeight: 1.4, color: MUTED, maxWidth: 940, lineClamp: 2, display: "block" }}>
              {detail}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 28, minHeight: 36 }}>
          {meta?.[0] && <span style={{ color: ORANGE }}>{meta[0]}</span>}
          {meta?.[1] && <span style={{ color: MUTED }}>{meta[1]}</span>}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Bricolage Grotesque", data: bricolage, weight: 700, style: "normal" },
        { name: "Instrument Sans", data: instrument, weight: 400, style: "normal" },
      ],
    },
  );
}
