import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { areas } from "./schema.ts";

const db = drizzle(neon(process.env.DATABASE_URL!));

await db
  .insert(areas)
  .values([
    {
      slug: "sql",
      name: "SQL",
      description: "Consultas, modelagem e performance em bancos relacionais.",
      topics: [
        "Modelagem de dados e normalização",
        "Consultas com SELECT, WHERE e ORDER BY",
        "JOINs entre várias tabelas",
        "Agregações com GROUP BY e HAVING",
        "Subqueries e CTEs",
        "Window functions para rankings e acumulados",
        "Índices e análise de planos com EXPLAIN",
        "Transações e níveis de isolamento",
        "Views e views materializadas",
        "Procedures, functions e triggers",
        "Constraints e integridade referencial",
        "Migração e limpeza de dados legados",
      ],
    },
    {
      slug: "software-engineering",
      name: "Software Engineering",
      description: "Arquitetura, testes, refatoração e boas práticas de código.",
      topics: [
        "Refatoração de código legado",
        "Testes unitários e TDD",
        "Princípios SOLID na prática",
        "Design patterns: Strategy, Factory e Observer",
        "Arquitetura em camadas e Clean Architecture",
        "Modelagem de domínio com DDD",
        "Design de APIs REST",
        "Git flow, code review e pull requests",
        "CI/CD com GitHub Actions",
        "Tratamento de erros e logging",
        "Documentação técnica e ADRs",
        "Requisitos, histórias de usuário e critérios de aceite",
      ],
    },
    {
      slug: "python",
      name: "Python",
      description: "Scripts, automação, dados e APIs com Python.",
      topics: [
        "Estruturas de dados: listas, dicionários e sets",
        "Funções, módulos e pacotes",
        "Orientação a objetos",
        "Leitura e escrita de arquivos CSV e JSON",
        "Automação de tarefas e scripts de linha de comando",
        "Consumo de APIs com requests",
        "Análise de dados com pandas",
        "Web scraping",
        "API REST com FastAPI",
        "Testes com pytest",
        "Acesso a banco de dados com SQLAlchemy",
        "Tratamento de exceções e validação de dados",
      ],
    },
    {
      slug: "front-end",
      name: "Front-end Web Engineering",
      description: "HTML, CSS, JavaScript, acessibilidade e interfaces web.",
      topics: [
        "HTML semântico e acessibilidade",
        "Layout responsivo com Flexbox e Grid",
        "Formulários com validação nativa",
        "Manipulação do DOM com JavaScript",
        "Consumo de APIs com fetch e async/await",
        "Componentes e estado em React",
        "Roteamento e data fetching em Next.js",
        "Estilização com Tailwind CSS",
        "Performance e Core Web Vitals",
        "TypeScript no front-end",
        "Testes de componentes",
        "Design system e componentes reutilizáveis",
      ],
    },
  ])
  .onConflictDoUpdate({
    target: areas.slug,
    set: { name: sql`excluded.name`, description: sql`excluded.description`, topics: sql`excluded.topics` },
  });

console.log("Áreas e temas atualizados.");
