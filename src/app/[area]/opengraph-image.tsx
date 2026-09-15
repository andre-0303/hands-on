import { eq } from "drizzle-orm";
import { db, areas } from "@/db";
import { renderOg, ogSize } from "@/lib/og";

export const alt = "Hands ons da área";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ area: string }> }) {
  const [area] = await db.select().from(areas).where(eq(areas.slug, (await params).area));
  return renderOg({ title: area?.name ?? "Hands On", detail: area?.description, meta: ["Hands ons por nível"] });
}
