import { getAdmin } from "@/auth";
import { db, areas } from "@/db";
import { SignIn } from "../SignIn";
import { GenerateForm } from "../forms";

// Free models are slow and generation may retry up to 3 times.
export const maxDuration = 300;
export const metadata = { title: "Gerar hands on" };

export default async function NovoPage() {
  if (!(await getAdmin())) return <SignIn />;
  const list = await db.select().from(areas).orderBy(areas.id);

  return (
    <>
      <h1 className="font-display text-4xl font-bold tracking-tight">Gerar hands on</h1>
      <p className="mt-3 max-w-xl text-muted">
        A IA cria um rascunho com cenário, passos, dicas e gabarito. Sem tema, ela escolhe um que ainda não existe na área. Você revisa antes de publicar.
      </p>
      <GenerateForm areas={list} />
    </>
  );
}
