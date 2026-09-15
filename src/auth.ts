import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    signIn: ({ profile }) => profile?.login === process.env.ADMIN_GITHUB_LOGIN,
  },
});

// Only the admin can sign in, but check anyway: server actions are public POST endpoints.
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado.");
  return session;
}
