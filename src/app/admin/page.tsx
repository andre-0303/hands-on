import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getAdmin } from "@/auth";
import { db, areas, handsOns } from "@/db";
import { LEVEL_LABEL } from "@/lib/handson";
import { SignIn } from "./SignIn";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  if (!(await getAdmin())) return <SignIn />;

  const rows = await db
    .select({ h: handsOns, area: areas })
    .from(handsOns)
    .innerJoin(areas, eq(areas.id, handsOns.areaId))
    .orderBy(desc(handsOns.updatedAt));

  return (
    <>
      <h1 className="font-display text-4xl font-bold tracking-tight">
        Hands ons
      </h1>
      {rows.length === 0 ? (
        <p className="mt-6 text-muted">
          Nenhum hands on ainda.{" "}
          <Link
            href="/admin/novo"
            className="text-orange-soft underline underline-offset-4"
          >
            Gere o primeiro
          </Link>
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="text-muted">
              <tr className="border-b border-line">
                <th className="py-3 pr-4 font-normal">Título</th>
                <th className="py-3 pr-4 font-normal">Área</th>
                <th className="py-3 pr-4 font-normal">Nível</th>
                <th className="py-3 pr-4 font-normal">Status</th>
                <th className="py-3 font-normal">Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ h, area }) => (
                <tr key={h.id} className="border-b border-line">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/${h.id}`}
                      className="font-medium hover:text-orange"
                    >
                      {h.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-muted">{area.name}</td>
                  <td className="py-3 pr-4 text-muted">
                    {LEVEL_LABEL[h.level]}
                  </td>
                  <td className="py-3 pr-4">
                    {h.status === "published" ? (
                      <Link
                        href={`/${area.slug}/${h.slug}`}
                        className="text-orange-soft hover:underline"
                      >
                        Publicado
                      </Link>
                    ) : (
                      <span className="text-muted">Rascunho</span>
                    )}
                  </td>
                  <td className="py-3 text-muted">
                    {h.updatedAt.toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
