import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Logo } from "@/components/Logo";

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
          <Logo width={48} height={48} fill={ORANGE} />
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
