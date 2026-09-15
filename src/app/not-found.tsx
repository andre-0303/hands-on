import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-24">
      <h1 className="font-display text-5xl font-bold tracking-tight">Página não encontrada</h1>
      <p className="mt-4 text-muted">Esse hands on não existe ou ainda não foi publicado.</p>
      <Link href="/" className="mt-8 inline-block text-orange-soft underline underline-offset-4">
        Ver áreas
      </Link>
    </div>
  );
}
