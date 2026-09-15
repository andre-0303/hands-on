import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getAdmin } from "@/auth";
import { db, areas, handsOns } from "@/db";
import { SignIn } from "../SignIn";
import { EditForm } from "../forms";

export const metadata = { title: "Editar hands on" };

export default async function EditPage({ params }: PageProps<"/admin/[id]">) {
  if (!(await getAdmin())) return <SignIn />;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [h] = await db.select().from(handsOns).where(eq(handsOns.id, id));
  if (!h) notFound();
  const list = await db.select().from(areas).orderBy(areas.id);
  const area = list.find((a) => a.id === h.areaId)!;

  return (
    <EditForm
      handsOn={h}
      areas={list}
      publicUrl={`/${area.slug}/${h.slug}`}
    />
  );
}
