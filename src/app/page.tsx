import Link from "next/link";
import { and, count, desc, eq, getTableColumns } from "drizzle-orm";
import { db, areas, handsOns } from "@/db";
import { LEVEL_LABEL } from "@/lib/handson";
import { InlineMarkdown } from "@/components/Markdown";

export default async function Home() {
  const rows = await db
    .select({ ...getTableColumns(areas), total: count(handsOns.id) })
    .from(areas)
    .leftJoin(
      handsOns,
      and(eq(handsOns.areaId, areas.id), eq(handsOns.status, "published")),
    )
    .groupBy(areas.id)
    .orderBy(areas.id);

  const latest = await db
    .select({ h: handsOns, area: areas })
    .from(handsOns)
    .innerJoin(areas, eq(areas.id, handsOns.areaId))
    .where(eq(handsOns.status, "published"))
    .orderBy(desc(handsOns.publishedAt))
    .limit(3);

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-12 sm:pt-28 sm:pb-16">
        <h1 className="max-w-4xl font-display text-5xl leading-[0.95] font-bold tracking-tight sm:text-7xl lg:text-8xl">
          Menos tutorial, mais mão na massa.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          Cada hands on parte de um problema de uma empresa fictícia e te guia
          passo a passo até a entrega, com dica e gabarito quando você travar.
        </p>
      </section>

      <section
        id="areas"
        aria-labelledby="areas-title"
        className="mx-auto max-w-6xl px-5 pb-24"
      >
        <h2 id="areas-title" className="sr-only">
          Áreas
        </h2>
        <ul className="border-t border-line">
          {rows.map((a) => (
            <li key={a.id} className="border-b border-line">
              <Link
                href={`/${a.slug}`}
                className="group -mx-5 flex flex-col gap-2 px-5 py-8 transition-colors hover:bg-orange hover:text-ink sm:flex-row sm:items-end sm:justify-between sm:gap-8"
              >
                <span className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  {a.name}
                </span>
                <span className="flex flex-col gap-1 sm:max-w-sm sm:items-end sm:text-right">
                  <span className="text-muted group-hover:text-ink">
                    {a.description}
                  </span>
                  <span className="text-sm font-medium">
                    {a.total === 0
                      ? "Em breve"
                      : `${a.total} hands on${a.total > 1 ? "s" : ""}`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {latest.length > 0 && (
        <section aria-labelledby="ultimos" className="mx-auto max-w-6xl px-5 pb-24">
          <h2 id="ultimos" className="font-display text-2xl font-semibold tracking-tight">
            Publicados recentemente
          </h2>
          <ul className="mt-6 border-t border-line">
            {latest.map(({ h, area }) => (
              <li key={h.id} className="border-b border-line">
                <Link href={`/${area.slug}/${h.slug}`} className="group block py-6">
                  <span className="flex flex-wrap gap-x-3 text-sm">
                    <span className="text-orange-soft">{area.name}</span>
                    <span className="text-muted">{LEVEL_LABEL[h.level]}</span>
                  </span>
                  <span className="mt-1 block font-display text-xl font-semibold tracking-tight group-hover:text-orange sm:text-2xl">
                    <InlineMarkdown>{h.title}</InlineMarkdown>
                  </span>
                  <span className="mt-2 block max-w-2xl text-muted">
                    <InlineMarkdown>{h.summary}</InlineMarkdown>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
