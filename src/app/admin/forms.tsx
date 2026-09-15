"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import type { handsOns } from "@/db/schema";
import { LEVELS, LEVEL_LABEL, type Step } from "@/lib/handson";
import { generate, remove, save, type FormState } from "./actions";

type Area = { id: number; name: string };

const field =
  "mt-1.5 w-full rounded-md border border-line bg-panel px-3 py-2 text-fg placeholder:text-muted/60 focus:border-orange focus:outline-none";
const primary =
  "rounded-md bg-orange px-5 py-2.5 font-medium text-ink hover:bg-orange-soft disabled:cursor-wait disabled:opacity-60";
const secondary =
  "rounded-md border border-line px-5 py-2.5 font-medium hover:border-fg disabled:cursor-wait disabled:opacity-60";

// Submit via transition instead of <form action> so React doesn't reset the fields afterwards.
function submitTo(action: (form: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => action(form));
  };
}

function Status({ state }: { state: FormState }) {
  if (state.error) return <p role="alert" className="text-sm text-red-400">{state.error}</p>;
  if (state.ok) return <p role="status" className="text-sm text-orange-soft">{state.ok}</p>;
  return null;
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{text}</span>
      {children}
    </label>
  );
}

export function GenerateForm({ areas }: { areas: (Area & { topics: string[] })[] }) {
  const [state, action, pending] = useActionState(generate, {});
  const [areaId, setAreaId] = useState(areas[0]?.id);
  const topics = areas.find((a) => a.id === areaId)?.topics ?? [];

  return (
    <form onSubmit={submitTo(action)} className="mt-10 max-w-xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Label text="Área">
          <select name="areaId" value={areaId} onChange={(e) => setAreaId(Number(e.target.value))} className={field}>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Label>
        <Label text="Nível">
          <select name="level" className={field} defaultValue="intermediario">
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABEL[l]}
              </option>
            ))}
          </select>
        </Label>
      </div>
      <Label text="Tema (opcional)">
        <input
          name="topic"
          list="topics"
          autoComplete="off"
          placeholder="Deixe vazio para a IA escolher, ou escolha uma sugestão"
          className={field}
        />
        <datalist id="topics">
          {topics.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </Label>
      <Label text="Observações (opcional)">
        <textarea
          name="notes"
          rows={3}
          placeholder="Ex: usar PostgreSQL, focar em window functions, cenário de e-commerce"
          className={field}
        />
      </Label>
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={pending} className={primary}>
          {pending ? "Gerando, pode levar alguns minutos…" : "Gerar rascunho"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function EditForm({
  handsOn: h,
  areas,
  publicUrl,
}: {
  handsOn: typeof handsOns.$inferSelect;
  areas: Area[];
  publicUrl: string;
}) {
  const [state, action, pending] = useActionState(save.bind(null, h.id), {});
  const [steps, setSteps] = useState<Step[]>(h.steps);
  const published = h.status === "published";

  const updateStep = (i: number, key: keyof Step, value: string) =>
    setSteps((s) => s.map((step, j) => (j === i ? { ...step, [key]: value } : step)));

  return (
    <form onSubmit={submitTo(action)} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {published ? (
            <>
              Publicado.{" "}
              <Link href={publicUrl} className="text-orange-soft underline underline-offset-4">
                Ver página
              </Link>
            </>
          ) : (
            "Rascunho, visível só para você."
          )}
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Excluir este hands on? Não dá para desfazer.")) startTransition(() => remove(h.id));
          }}
          className="text-sm text-muted hover:text-red-400"
        >
          Excluir
        </button>
      </div>

      <input type="hidden" name="steps" value={JSON.stringify(steps)} />

      <Label text="Título">
        <input name="title" required defaultValue={h.title} className={`${field} font-display text-2xl font-semibold`} />
      </Label>
      <Label text="Resumo">
        <textarea name="summary" required rows={2} defaultValue={h.summary} className={field} />
      </Label>
      <div className="grid gap-5 sm:grid-cols-2">
        <Label text="Área">
          <select name="areaId" defaultValue={h.areaId} className={field}>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Label>
        <Label text="Nível">
          <select name="level" defaultValue={h.level} className={field}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABEL[l]}
              </option>
            ))}
          </select>
        </Label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Label text="Pré-requisitos (um por linha)">
          <textarea name="prerequisites" rows={4} defaultValue={h.prerequisites.join("\n")} className={field} />
        </Label>
        <Label text="Tags (separadas por vírgula)">
          <textarea name="tags" rows={4} defaultValue={h.tags.join(", ")} className={field} />
        </Label>
      </div>
      <Label text="Cenário (markdown)">
        <textarea name="scenario" required rows={8} defaultValue={h.scenario} className={`${field} font-mono text-sm`} />
      </Label>

      <fieldset className="space-y-6">
        <legend className="font-display text-2xl font-semibold">Passos</legend>
        {steps.map((s, i) => (
          <div key={i} className="rounded-lg border border-line p-5">
            <div className="flex items-center gap-4">
              <span className="font-display text-3xl font-bold text-orange tabular-nums">{i + 1}</span>
              <input
                aria-label={`Título do passo ${i + 1}`}
                value={s.title}
                onChange={(e) => updateStep(i, "title", e.target.value)}
                className={`${field} mt-0 font-medium`}
              />
              <button
                type="button"
                disabled={steps.length === 1}
                onClick={() => setSteps((all) => all.filter((_, j) => j !== i))}
                className="shrink-0 text-sm text-muted hover:text-red-400 disabled:invisible"
              >
                Remover
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {(
                [
                  ["instructions", "Instruções", 6],
                  ["hint", "Dica", 3],
                  ["solution", "Gabarito", 8],
                ] as const
              ).map(([key, label, rows]) => (
                <Label key={key} text={`${label} (markdown)`}>
                  <textarea
                    rows={rows}
                    value={s[key]}
                    onChange={(e) => updateStep(i, key, e.target.value)}
                    className={`${field} font-mono text-sm`}
                  />
                </Label>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSteps((all) => [...all, { title: "", instructions: "", hint: "", solution: "" }])}
          className={secondary}
        >
          Adicionar passo
        </button>
      </fieldset>

      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-3 border-t border-line bg-ink/95 px-5 py-4 backdrop-blur">
        <button name="intent" value="save" disabled={pending} className={secondary}>
          Salvar
        </button>
        {published ? (
          <button name="intent" value="unpublish" disabled={pending} className={secondary}>
            Salvar e despublicar
          </button>
        ) : (
          <button name="intent" value="publish" disabled={pending} className={primary}>
            Salvar e publicar
          </button>
        )}
        <Status state={state} />
      </div>
    </form>
  );
}
