import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Rede doméstica sem rota IPv6 derruba ~5% das conexões com "fetch failed".
neonConfig.fetchFunction = async (input: RequestInfo | URL, init?: RequestInit) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(input, init);
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((r) => setTimeout(r, 200 * 2 ** attempt));
    }
  }
};

export const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
export * from "./schema";
