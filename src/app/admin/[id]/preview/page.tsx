import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getAdmin } from "@/auth";
import { db, areas, handsOns } from "@/db";
import { HandsOnArticle } from "@/components/HandsOnArticle";
import { SignIn } from "../../SignIn";

export const metadata = { title: "Pré-visualização" };

export default async function PreviewPage({ params }: PageProps<"/admin/[id]/preview">) {
  if (!(await getAdmin())) return <SignIn />;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [row] = await db
    .select({ h: handsOns, area: areas })
    .from(handsOns)
    .innerJoin(areas, eq(areas.id, handsOns.areaId))
    .where(eq(handsOns.id, id));
  if (!row) notFound();

  return (
    <>
      <p className="-mt-2 mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-orange/60 px-4 py-3 text-sm">
        <span className="font-medium text-orange">Pré-visualização</span>
        <span className="text-muted">
          {row.h.status === "draft" ? "Rascunho, ainda não publicado." : "Publicado."} Mostra a última versão salva.
        </span>
        <Link href={`/admin/${id}`} className="ml-auto text-orange-soft hover:underline">
          Voltar para a edição
        </Link>
      </p>
      <HandsOnArticle handsOn={row.h} area={row.area} />
    </>
  );
}
