"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

type Progress = { done: Set<number>; toggle: (i: number) => void; clear: () => void; total: number };

const ProgressContext = createContext<Progress>({ done: new Set(), toggle: () => {}, clear: () => {}, total: 0 });

// localStorage como fonte externa: o servidor renderiza tudo em aberto e o navegador sincroniza no mount.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function read(key: string) {
  try {
    return localStorage.getItem(key) ?? "[]";
  } catch {
    return "[]"; // aba anônima ou storage bloqueado
  }
}

function parse(raw: string): number[] {
  try {
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

function write(key: string, value: number[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  listeners.forEach((l) => l());
}

export function ProgressProvider({ slug, total, children }: { slug: string; total: number; children: ReactNode }) {
  const key = `handson:${slug}`;
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => "[]",
  );

  const value = useMemo<Progress>(() => {
    const done = new Set(parse(raw));
    return {
      done,
      total,
      toggle: (i) => {
        // relê na hora do clique: dois cliques no mesmo tick não podem sobrescrever um ao outro
        const next = new Set(parse(read(key)));
        if (!next.delete(i)) next.add(i);
        write(key, [...next]);
      },
      clear: () => write(key, []),
    };
  }, [raw, key, total]);

  return <ProgressContext value={value}>{children}</ProgressContext>;
}

export function ProgressSummary() {
  const { done, clear, total } = useContext(ProgressContext);
  const next = Array.from({ length: total }, (_, i) => i).find((i) => !done.has(i));

  return (
    <div className="border-t border-line pt-5">
      <p className="text-sm">
        <span className="font-medium">{done.size}</span>
        <span className="text-muted">
          {" "}
          de {total} {total === 1 ? "passo" : "passos"}
        </span>
      </p>
      <div className="mt-2 h-1 w-full rounded-full bg-line">
        <div
          className="h-1 rounded-full bg-orange transition-[width]"
          style={{ width: `${total ? (done.size / total) * 100 : 0}%` }}
        />
      </div>
      {done.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {next !== undefined && (
            <a href={`#passo-${next + 1}`} className="text-orange-soft hover:underline">
              Continuar do passo {next + 1}
            </a>
          )}
          <button type="button" onClick={clear} className="text-muted hover:text-fg">
            Limpar progresso
          </button>
        </div>
      )}
    </div>
  );
}

export function StepNumber({ index }: { index: number }) {
  const { done } = useContext(ProgressContext);
  return (
    <span
      aria-hidden
      className={`font-display text-5xl leading-none font-bold tabular-nums sm:text-7xl ${
        done.has(index) ? "text-muted" : "text-orange"
      }`}
    >
      {index + 1}
    </span>
  );
}

export function StepToggle({ index }: { index: number }) {
  const { done, toggle } = useContext(ProgressContext);
  const isDone = done.has(index);

  return (
    <button
      type="button"
      aria-pressed={isDone}
      onClick={() => toggle(index)}
      className={`rounded-md border px-4 py-3 text-sm font-medium ${
        isDone ? "border-orange/60 text-orange" : "border-line text-muted hover:border-fg hover:text-fg"
      }`}
    >
      {isDone ? "Passo concluído" : "Marcar como concluído"}
    </button>
  );
}
