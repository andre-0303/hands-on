import { handsOnSchema, parseAiJson, LEVEL_LABEL, type HandsOnInput, type Level } from "./handson.ts";

const SYSTEM = `Você é um professor de tecnologia que escreve hands ons no estilo da FIAP: projetos práticos, "mão na massa", com contexto de mercado.
Responda SOMENTE com um objeto JSON, sem texto fora dele, neste formato:
{
  "title": string,           // título curto e específico
  "summary": string,         // 1-2 frases: o que a pessoa vai construir e aprender
  "level": "iniciante" | "intermediario" | "avancado",
  "scenario": string,        // markdown: empresa fictícia, problema real, o que precisa ser entregue
  "prerequisites": string[], // conhecimentos e ferramentas necessários
  "tags": string[],          // tecnologias e conceitos (ex: "PostgreSQL", "JOIN")
  "steps": [                 // 5 a 10 passos incrementais, cada um construindo sobre o anterior
    {
      "title": string,
      "instructions": string, // markdown: o que fazer e critério para saber que terminou, sem entregar a resposta
      "hint": string,         // markdown: um empurrão, sem a solução completa
      "solution": string      // markdown: solução de referência e breve explicação
    }
  ]
}
Regras:
- Tudo em português do Brasil.
- Todo código, em qualquer campo, fica dentro de bloco markdown cercado com a linguagem: \`\`\`sql ... \`\`\`. Nunca escreva código solto em "solution".
- "tags": no máximo 6, só as mais relevantes.
- "prerequisites": só o que a pessoa já precisa saber ANTES; não liste o que o hands on ensina.
- Cenário, passos e gabarito devem ser coerentes entre si (mesmas tabelas, nomes e regras).`;

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function chat(messages: Msg[]): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL,
      messages,
      response_format: { type: "json_object" },
      reasoning: { effort: "low" },
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter respondeu ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter não retornou conteúdo.");
  return content;
}

export type GenerateInput = {
  area: string;
  topic: string;
  level: Level;
  notes: string;
  existing: string[]; // títulos já cadastrados na área
  suggestions: string[]; // banco de temas da área
};

export function buildUserPrompt(i: GenerateInput): string {
  const lines = [`Área: ${i.area}`, `Nível: ${LEVEL_LABEL[i.level]} (use "${i.level}")`];
  if (i.topic) {
    lines.push(`Tema: ${i.topic}`);
  } else {
    lines.push("Tema: escolha você um tema relevante para a área e adequado ao nível.");
    if (i.suggestions.length) lines.push(`Temas sugeridos para esta área:\n${i.suggestions.map((t) => `- ${t}`).join("\n")}`);
  }
  if (i.existing.length) {
    lines.push(`Hands ons que já existem nesta área (não repita o tema nem o cenário):\n${i.existing.map((t) => `- ${t}`).join("\n")}`);
  }
  if (i.notes) lines.push(`Observações: ${i.notes}`);
  return lines.join("\n");
}

export async function generateHandsOn(input: GenerateInput): Promise<HandsOnInput> {
  const messages: Msg[] = [
    { role: "system", content: SYSTEM },
    { role: "user", content: buildUserPrompt(input) },
  ];

  let lastError = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const raw = await chat(messages);
    try {
      const parsed = handsOnSchema.safeParse(parseAiJson(raw));
      if (parsed.success) return parsed.data;
      lastError = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    } catch (e) {
      lastError = (e as Error).message;
    }
    messages.push(
      { role: "assistant", content: raw },
      { role: "user", content: `O JSON não é válido:\n${lastError}\nResponda de novo apenas com o JSON corrigido.` },
    );
  }
  throw new Error(`A IA não gerou um hands on válido após 3 tentativas. Último erro: ${lastError}`);
}
