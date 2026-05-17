import "server-only";
import postgres, { type Sql } from "postgres";

// Lazy singleton — don't throw at module load (build-time evaluation
// happens without DATABASE_URL). Initialized on first SQL call.
declare global {
  // eslint-disable-next-line no-var
  var __pgSql: Sql | undefined;
}

function makeClient(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Connect Neon via Vercel Storage.");
  }
  return postgres(url, {
    prepare: false, // Neon pooler doesn't support prepared statements
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

export const sql: Sql = new Proxy({} as Sql, {
  get(_target, prop) {
    const client = global.__pgSql ?? (global.__pgSql = makeClient());
    // Bind sql.json, sql.unsafe, etc. correctly; forward template-tag
    // call via Reflect.
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
  apply(_target, _thisArg, args: Parameters<Sql>) {
    const client = global.__pgSql ?? (global.__pgSql = makeClient());
    // postgres()`...` template-tag call
    return (client as unknown as (...args: Parameters<Sql>) => unknown)(...args);
  },
});
