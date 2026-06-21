import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
export const prisma = new PrismaClient({
  adapter,
  // Never return the password hash unless a query explicitly opts back in
  // with `omit: { password: false }`.
  omit: { user: { password: true } },
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`Select 1`;
    return true;
  } catch (error) {
    console.error(`Database connection failed: ${error}`);
    return false;
  }
}
