import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db, areas, handsOns } from "@/db";
import { LEVELS, LEVEL_LABEL, type Level } from "@/lib/handson";
import { InlineMarkdown } from "@/components/Markdown";

async function getArea(slug: string) {
  const [area] = await db.select().from(areas).where(eq(areas.slug, slug));
  return area;
}

export async function generateMetadata({ params }: PageProps<"/[area]">): Promise<Metadata> {
  const area = await getArea((await params).area);
  return { title: area?.name };
}

export default async function AreaPage({ params, searchParams }: PageProps<"/[area]">) {
  const area = await getArea((await params).area);
  if (!area) notFound();

  const nivel = (await searchParams).nivel;
  const level = LEVELS.includes(nivel as Level) ? (nivel as Level) : undefined;

  const list = await db
    .select()
    .from(handsOns)
    .where(
      and(eq(handsOns.areaId, area.id), eq(handsOns.status, "published"), level ? eq(handsOns.level, level) : undefined),
    )
    .orderBy(desc(handsOns.publishedAt));

  const filters = [{ label: "Todos", value: undefined }, ...LEVELS.map((l) => ({ label: LEVEL_LABEL[l], value: l }))];

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 pb-24">
      <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">{area.name}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{area.description}</p>

      <nav aria-label="Filtrar por nível" className="mt-10 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = f.value === level;
          return (
            <Link
              key={f.label}
              href={f.value ? `/${area.slug}?nivel=${f.value}` : `/${area.slug}`}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm ${
                active ? "border-orange bg-orange text-ink" : "border-line text-muted hover:border-fg hover:text-fg"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {list.length === 0 ? (
        <p className="mt-12 border-t border-line pt-8 text-muted">
          Nenhum hands on {level ? `de nível ${LEVEL_LABEL[level].toLowerCase()} ` : ""}publicado nesta área ainda.
          {level && (
            <>
              {" "}
              <Link href={`/${area.slug}`} className="text-orange-soft underline underline-offset-4">
                Ver todos os níveis
              </Link>
            </>
          )}
        </p>
      ) : (
        <ul className="mt-10 border-t border-line">
          {list.map((h) => (
            <li key={h.id} className="border-b border-line">
              <Link href={`/${area.slug}/${h.slug}`} className="group block py-7">
                <span className="text-sm text-orange-soft">{LEVEL_LABEL[h.level]}</span>
                <span className="mt-1 block font-display text-2xl font-semibold tracking-tight group-hover:text-orange sm:text-3xl">
                  <InlineMarkdown>{h.title}</InlineMarkdown>
                </span>
                <span className="mt-2 block max-w-2xl text-muted">
                  <InlineMarkdown>{h.summary}</InlineMarkdown>
                </span>
                {h.tags.length > 0 && (
                  <span className="mt-4 flex flex-wrap gap-1.5">
                    {h.tags.map((t) => (
                      <span key={t} className="rounded border border-line px-2 py-0.5 text-xs text-muted">
                        {t}
                      </span>
                    ))}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
