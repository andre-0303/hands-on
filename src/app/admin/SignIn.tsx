import { login } from "./actions";

export function SignIn() {
  return (
    <div className="max-w-md py-10">
      <h1 className="font-display text-3xl font-bold">Área do admin</h1>
      <p className="mt-3 text-muted">Entre com a conta do GitHub autorizada para gerar e publicar hands ons.</p>
      <form action={login} className="mt-6">
        <button className="rounded-md bg-orange px-5 py-2.5 font-medium text-ink hover:bg-orange-soft">
          Entrar com GitHub
        </button>
      </form>
    </div>
  );
}
