# Hands On

Projetos práticos por área (SQL, Software Engineering, Python, Front-end), com cenário, passo a passo, dica e gabarito. Os hands ons são gerados por IA (OpenRouter), revisados no `/admin` e publicados.

## Rodando local

```bash
pnpm install
cp .env.example .env   # preencha as variáveis
pnpm db:push           # cria as tabelas no Neon (drizzle-kit lê DATABASE_URL do .env)
pnpm db:seed           # cria as 4 áreas
pnpm dev
```

Acesse `/admin`, entre com o GitHub definido em `ADMIN_GITHUB_LOGIN`, gere um hands on, revise e publique.

## Scripts

- `pnpm test`: testes do parser e do schema do hands on
- `pnpm build`: build de produção (precisa de `DATABASE_URL`, porque a home é pré-renderizada)

## Deploy (Vercel)

Importe o repositório, configure as mesmas variáveis do `.env` e crie outro OAuth App do GitHub com callback `https://SEU-DOMINIO/api/auth/callback/github`.
