import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, areas, handsOns } from "@/db";
import { LEVEL_LABEL } from "@/lib/handson";
import { Markdown } from "@/components/Markdown";

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
  return row ? { title: row.h.title, description: row.h.summary } : {};
}

export default async function HandsOnPage({ params }: PageProps<"/[area]/[slug]">) {
  const { area: areaSlug, slug } = await params;
  const row = await getHandsOn(areaSlug, slug);
  if (!row) notFound();
  const { h, area } = row;

  return (
    <article className="mx-auto max-w-6xl px-5 pt-12 pb-24">
      <Link href={`/${area.slug}`} className="text-sm text-muted hover:text-fg">
        ← {area.name}
      </Link>
      <h1 className="mt-6 max-w-4xl font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
        {h.title}
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">{h.summary}</p>

      <div className="mt-12 grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <dl className="space-y-6 text-sm">
            <div>
              <dt className="text-muted">Nível</dt>
              <dd className="mt-1 font-medium">{LEVEL_LABEL[h.level]}</dd>
            </div>
            {h.prerequisites.length > 0 && (
              <div>
                <dt className="text-muted">Antes de começar</dt>
                <dd className="mt-1">
                  <ul className="space-y-1">
                    {h.prerequisites.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {h.tags.length > 0 && (
              <div>
                <dt className="text-muted">Tecnologias</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {h.tags.map((t) => (
                    <span key={t} className="rounded border border-line px-2 py-0.5 text-xs">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          <nav aria-label="Passos" className="mt-8 hidden border-t border-line pt-6 lg:block">
            <ol className="space-y-2 text-sm">
              {h.steps.map((s, i) => (
                <li key={i}>
                  <a href={`#passo-${i + 1}`} className="flex gap-3 text-muted hover:text-fg">
                    <span className="w-4 text-right text-orange tabular-nums">{i + 1}</span>
                    <span>{s.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="max-w-3xl">
          <section aria-labelledby="cenario" className="rounded-lg border border-line bg-panel p-6 sm:p-8">
            <h2 id="cenario" className="font-display text-2xl font-semibold">
              O cenário
            </h2>
            <div className="mt-4">
              <Markdown>{h.scenario}</Markdown>
            </div>
          </section>

          <ol className="mt-16 space-y-16">
            {h.steps.map((s, i) => (
              <li key={i} id={`passo-${i + 1}`} className="scroll-mt-8">
                <div className="flex items-baseline gap-4">
                  <span
                    aria-hidden
                    className="font-display text-6xl leading-none font-bold text-orange tabular-nums sm:text-7xl"
                  >
                    {i + 1}
                  </span>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    <span className="sr-only">Passo {i + 1}: </span>
                    {s.title}
                  </h2>
                </div>
                <div className="mt-5">
                  <Markdown>{s.instructions}</Markdown>
                </div>
                <div className="mt-6 space-y-3">
                  <Reveal label="Ver dica">{s.hint}</Reveal>
                  <Reveal label="Ver gabarito">{s.solution}</Reveal>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
}

function Reveal({ label, children }: { label: string; children: string }) {
  return (
    <details className="group rounded-md border border-line open:border-orange/60">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium select-none hover:text-orange [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="inline-block transition-transform group-open:rotate-90">
          ›
        </span>
        {label}
      </summary>
      <div className="border-t border-line px-4 py-4">
        <Markdown>{children}</Markdown>
      </div>
    </details>
  );
}
