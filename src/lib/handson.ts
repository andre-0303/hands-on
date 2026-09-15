import { z } from "zod";

export const LEVELS = ["iniciante", "intermediario", "avancado"] as const;
export type Level = (typeof LEVELS)[number];
export const LEVEL_LABEL: Record<Level, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

// Limites generosos: evitam payloads gigantes vindos do form ou da IA.
const text = (max: number) => z.string().trim().min(1).max(max);

export const stepSchema = z.object({
  title: text(200),
  instructions: text(20_000),
  hint: text(5_000),
  solution: text(30_000),
});
export type Step = z.infer<typeof stepSchema>;

export const handsOnSchema = z.object({
  title: text(200),
  summary: text(1_000),
  level: z.enum(LEVELS),
  scenario: text(20_000),
  prerequisites: z.array(text(300)).max(20),
  tags: z.array(text(60)).max(20),
  steps: z.array(stepSchema).min(1).max(30),
});
export type HandsOnInput = z.infer<typeof handsOnSchema>;

// Models often wrap JSON in ```json fences or add prose around it.
export function parseAiJson(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end < start) throw new Error("Resposta da IA não contém JSON.");
  return JSON.parse(raw.slice(start, end + 1));
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// Para <title>, imagem OG e outros lugares sem HTML.
export function plainText(s: string): string {
  return s
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|\*|~~)(\S(?:.*?\S)?)\1/g, "$2")
    .replace(/(?<!\w)(__|_)(\S(?:.*?\S)?)\1(?!\w)/g, "$2"); // _ dentro de palavra (snake_case) não é ênfase
}

// A IA às vezes numera o título ("2. Criar tabela"), mas a página já mostra o número.
export function stepTitle(s: string): string {
  return s.replace(/^\s*(passo\s*)?\d+\s*[.):-]\s*/i, "");
}
