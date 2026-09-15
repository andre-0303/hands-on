import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const isAdminLogin = (login: unknown) => {
  const admin = process.env.ADMIN_GITHUB_LOGIN;
  return Boolean(admin) && typeof login === "string" && login.toLowerCase() === admin!.toLowerCase();
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  callbacks: {
    signIn: ({ profile }) => isAdminLogin(profile?.login),
    jwt: ({ token, profile }) => {
      if (profile) token.login = profile.login;
      return token;
    },
    session: ({ session, token }) => Object.assign(session, { login: token.login }),
  },
});

// Sessão válida E login ainda igual ao ADMIN_GITHUB_LOGIN atual
// (se o admin mudar, sessões antigas deixam de valer na hora).
export async function getAdmin() {
  const session = await auth();
  return session && isAdminLogin((session as { login?: unknown }).login) ? session : null;
}

// Server actions são endpoints POST públicos: toda action chama isto.
export async function requireAdmin() {
  if (!(await getAdmin())) throw new Error("Não autorizado.");
}
