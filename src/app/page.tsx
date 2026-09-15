import Link from "next/link";
import { and, count, eq, getTableColumns } from "drizzle-orm";
import { db, areas, handsOns } from "@/db";

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

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-20 pb-16 sm:pt-28">
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
    </>
  );
}
