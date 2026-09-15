"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db, areas, handsOns } from "@/db";
import { requireAdmin, signIn, signOut } from "@/auth";
import { generateHandsOn } from "@/lib/generate";
import { handsOnSchema, LEVELS, slugify, type Level } from "@/lib/handson";

export type FormState = { error?: string; ok?: string };

export async function login() {
  await signIn("github", { redirectTo: "/admin" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function generate(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const areaId = Number(form.get("areaId"));
  const topic = String(form.get("topic") ?? "").trim();
  const level = String(form.get("level")) as Level;
  const notes = String(form.get("notes") ?? "").trim();
  if (!LEVELS.includes(level)) return { error: "Escolha um nível." };

  const [area] = await db.select().from(areas).where(eq(areas.id, areaId));
  if (!area) return { error: "Área não encontrada." };

  const existing = await db
    .select({ title: handsOns.title })
    .from(handsOns)
    .where(eq(handsOns.areaId, areaId))
    .orderBy(desc(handsOns.createdAt))
    .limit(50);

  let id: number;
  try {
    const data = await generateHandsOn({
      area: area.name,
      topic,
      level,
      notes,
      existing: existing.map((e) => e.title),
      suggestions: area.topics,
    });
    const slug = `${slugify(data.title)}-${Math.random().toString(36).slice(2, 6)}`;
    [{ id }] = await db
      .insert(handsOns)
      .values({ ...data, areaId, slug })
      .returning({ id: handsOns.id });
  } catch (e) {
    return { error: (e as Error).message };
  }
  redirect(`/admin/${id}`);
}

const lines = (v: FormDataEntryValue | null, sep: string | RegExp) =>
  String(v ?? "")
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);

export async function save(id: number, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  let steps: unknown;
  try {
    steps = JSON.parse(String(form.get("steps")));
  } catch {
    return { error: "Passos inválidos." };
  }
  const parsed = handsOnSchema.safeParse({
    title: form.get("title"),
    summary: form.get("summary"),
    level: form.get("level"),
    scenario: form.get("scenario"),
    prerequisites: lines(form.get("prerequisites"), "\n"),
    tags: lines(form.get("tags"), ","),
    steps,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => `${i.path.join(".") || "campo"}: ${i.message}`).join("; ") };
  }

  const intent = form.get("intent");
  const [current] = await db.select({ publishedAt: handsOns.publishedAt }).from(handsOns).where(eq(handsOns.id, id));
  if (!current) return { error: "Hands on não encontrado." };

  await db
    .update(handsOns)
    .set({
      ...parsed.data,
      areaId: Number(form.get("areaId")),
      updatedAt: new Date(),
      ...(intent === "publish" && { status: "published", publishedAt: current.publishedAt ?? new Date() }),
      ...(intent === "unpublish" && { status: "draft" }),
    })
    .where(eq(handsOns.id, id));

  revalidatePath("/", "layout");
  return { ok: intent === "publish" ? "Publicado." : intent === "unpublish" ? "Despublicado." : "Alterações salvas." };
}

export async function remove(id: number) {
  await requireAdmin();
  await db.delete(handsOns).where(eq(handsOns.id, id));
  revalidatePath("/", "layout");
  redirect("/admin");
}
