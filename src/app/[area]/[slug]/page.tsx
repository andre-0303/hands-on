import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, areas, handsOns } from "@/db";
import { plainText } from "@/lib/handson";
import { HandsOnArticle } from "@/components/HandsOnArticle";

async function getHandsOn(areaSlug: string, slug: string) {
  const [row] = await db
    .select({ h: handsOns, area: areas })
    .from(handsOns)
    .innerJoin(areas, eq(areas.id, handsOns.areaId))
    .where(and(eq(handsOns.slug, slug), eq(areas.slug, areaSlug), eq(handsOns.status, "published")));
  return row;
}

export async function generateMetadata({ params }: PageProps<"/[area]/[slug]">): Promise<Metadata> {
  const { area, slug } = await params;
  const row = await getHandsOn(area, slug);
  return row ? { title: plainText(row.h.title), description: plainText(row.h.summary) } : {};
}

export default async function HandsOnPage({ params }: PageProps<"/[area]/[slug]">) {
  const { area: areaSlug, slug } = await params;
  const row = await getHandsOn(areaSlug, slug);
  if (!row) notFound();

  return <HandsOnArticle handsOn={row.h} area={row.area} />;
}
