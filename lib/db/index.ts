import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const client = postgres(process.env.DATABASE_URL);

// class MyLogger implements Logger {
//   logQuery(query: string, params: unknown[]): void {
//     console.log({ query, params });
//   }
// }

const db = drizzle({ client, schema });
db.execute("SET TIME ZONE 'Asia/Shanghai'");

export async function closeDb() {
  // Ensure all connections are closed so scripts can exit cleanly
  await client.end({ timeout: 0 });
}

export { db };
