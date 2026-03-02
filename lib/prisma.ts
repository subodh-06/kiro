import { PrismaClient } from "@prisma/client"; // (Or your custom path if you kept Option 2!)
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Set up the connection pool
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Create the Prisma adapter
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 3. Pass the adapter into the constructor
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // <-- THIS IS THE V7 FIX
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;