// lib/db.ts – client PG per Supabase
import { Pool } from 'pg';

let conn =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

if (!conn) {
  throw new Error('Missing DATABASE_URL / POSTGRES_PRISMA_URL / POSTGRES_URL');
}

// forza sslmode=require se non presente
if (!/sslmode=/i.test(conn)) {
  conn += (conn.includes('?') ? '&' : '?') + 'sslmode=require';
}

export const pool = new Pool({
  connectionString: conn,
  // su Supabase è necessario per evitare "self-signed certificate"
  ssl: { rejectUnauthorized: false },
});

export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const text = strings.reduce(
    (acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''),
    ''
  );
  const res = await pool.query(text, values);
  return { rows: res.rows };
}

export async function ensureSchema() {
  await pool.query(`create extension if not exists pgcrypto;`);
  await pool.query(`
    create table if not exists events (
      id uuid primary key default gen_random_uuid(),
      kind text not null check (kind in ('generate','publish')),
      created_at timestamptz not null default now()
    );
  `);
  await pool.query(`create index if not exists idx_events_created_at on events (created_at desc);`);
  await pool.query(`create index if not exists idx_events_kind on events (kind);`);
}
