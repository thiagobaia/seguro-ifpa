import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let localClient: PrismaClient | undefined;

function getPrismaClient() {
  const existing = globalForPrisma.prisma ?? localClient;
  if (existing) return existing;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada. Copie .env.example para .env e informe a URL do Neon.");
  }
  const adapter = new PrismaPg({ connectionString });
  localClient = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = localClient;
  return localClient;
}

// Adia a criação do cliente até que uma consulta ao banco seja realmente feita.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client) as unknown;
    return typeof value === "function" ? value.bind(client) : value;
  },
});
