// lib/db.ts — versione per Supabase con 'pg'
import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL / POSTGRES_PRISMA_URL / POSTGRES_URL');
}

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // necessario su Supabase
});

// mini helper tipo `sql` compatibile con il nostro uso
export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const text = strings.reduce(
    (acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''),
    ''
  );
  const res = await pool.query(text, values);
  return { rows: res.rows };
}

export async function ensureSchema() {
  // Supabase ha pgcrypto disponibile -> gen_random_uuid()
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
