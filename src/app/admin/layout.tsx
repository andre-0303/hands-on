import Link from "next/link";
import { getAdmin } from "@/auth";
import { logout } from "./actions";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getAdmin();
  return (
    <div className="mx-auto max-w-6xl px-5 pt-8 pb-24">
      {session && (
        <nav className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line pb-4 text-sm">
          <Link href="/admin" className="hover:text-orange">
            Hands ons
          </Link>
          <Link href="/admin/novo" className="hover:text-orange">
            Gerar novo
          </Link>
          <form action={logout} className="ml-auto">
            <button className="text-muted hover:text-fg">Sair ({session.user?.name})</button>
          </form>
        </nav>
      )}
      {children}
    </div>
  );
}
