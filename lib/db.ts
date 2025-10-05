// lib/db.ts — Supabase via 'pg' con TLS no-verify
import { Pool } from 'pg';

// Ultima rete di sicurezza — disattiva la verifica TLS a livello di processo
process.env.PGSSLMODE = process.env.PGSSLMODE || 'no-verify';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let conn =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

if (!conn) {
  throw new Error('Missing DATABASE_URL / POSTGRES_PRISMA_URL / POSTGRES_URL');
}

// Assicura sslmode=no-verify o require
if (!/sslmode=/i.test(conn)) {
  conn += (conn.includes('?') ? '&' : '?') + 'sslmode=no-verify';
}

export const pool = new Pool({
  connectionString: conn,
  // Disabilita la verifica del certificato (necessario con CA self-signed)
  ssl: { rejectUnauthorized: false },
});

// Helper tipo `sql`
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
