import { and, eq } from "drizzle-orm";
import { db, areas, handsOns } from "@/db";
import { LEVEL_LABEL, plainText } from "@/lib/handson";
import { renderOg, ogSize } from "@/lib/og";

export const alt = "Hands on";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ area: string; slug: string }> }) {
  const { area: areaSlug, slug } = await params;
  const [row] = await db
    .select({ title: handsOns.title, summary: handsOns.summary, level: handsOns.level, area: areas.name })
    .from(handsOns)
    .innerJoin(areas, eq(areas.id, handsOns.areaId))
    .where(and(eq(handsOns.slug, slug), eq(areas.slug, areaSlug), eq(handsOns.status, "published")));

  if (!row) return renderOg({ title: "Hands On" });
  return renderOg({ title: plainText(row.title), detail: plainText(row.summary), meta: [row.area, LEVEL_LABEL[row.level]] });
}
