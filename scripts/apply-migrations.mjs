// Apply every .sql file in /migrations sequentially using DATABASE_URL.
// Idempotent: every migration uses `create … if not exists`.
//
//   DATABASE_URL=postgres://… node scripts/apply-migrations.mjs

import postgres from "postgres";
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "migrations");

const connection = process.env.DATABASE_URL;
if (!connection) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(connection, { prepare: false });

const files = (await readdir(migrationsDir))
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  const path = join(migrationsDir, file);
  const body = await readFile(path, "utf8");
  console.log(`▶ ${file}`);
  await sql.unsafe(body);
  console.log(`  ok`);
}

await sql.end();
console.log("done");
