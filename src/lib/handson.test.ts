import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAiJson, slugify, handsOnSchema } from "./handson.ts";

const sample = {
  title: "Relatório de vendas",
  summary: "Consultas com JOIN",
  level: "iniciante",
  scenario: "A loja X precisa...",
  prerequisites: ["SELECT"],
  tags: ["sql"],
  steps: [{ title: "Criar tabelas", instructions: "Crie...", hint: "Use CREATE TABLE", solution: "```sql\nCREATE TABLE a();\n```" }],
};

test("parseAiJson aceita JSON puro, com cercas e com texto em volta", () => {
  const json = JSON.stringify(sample);
  assert.deepEqual(parseAiJson(json), sample);
  assert.deepEqual(parseAiJson("```json\n" + json + "\n```"), sample);
  assert.deepEqual(parseAiJson("Aqui está:\n" + json + "\nBons estudos!"), sample);
  assert.equal(handsOnSchema.safeParse(parseAiJson(json)).success, true);
});

test("parseAiJson falha sem JSON válido", () => {
  assert.throws(() => parseAiJson("não sei"));
  assert.throws(() => parseAiJson("{ quebrado "));
});

test("schema rejeita nível inválido e passos vazios", () => {
  assert.equal(handsOnSchema.safeParse({ ...sample, level: "facil" }).success, false);
  assert.equal(handsOnSchema.safeParse({ ...sample, steps: [] }).success, false);
});

test("slugify remove acentos e símbolos", () => {
  assert.equal(slugify("Relatório de Vendas: JOINs & Agregações!"), "relatorio-de-vendas-joins-agregacoes");
});

test("prompt sem tema pede para a IA escolher e evita repetidos", async () => {
  const { buildUserPrompt } = await import("./generate.ts");
  const base = { area: "SQL", level: "iniciante" as const, notes: "", existing: ["JOINs na loja"], suggestions: ["Índices"] };
  const semTema = buildUserPrompt({ ...base, topic: "" });
  assert.match(semTema, /escolha você/);
  assert.match(semTema, /- Índices/);
  assert.match(semTema, /não repita[\s\S]*- JOINs na loja/);
  const comTema = buildUserPrompt({ ...base, topic: "Views" });
  assert.match(comTema, /Tema: Views/);
  assert.doesNotMatch(comTema, /Temas sugeridos/);
});
