import { sql } from '@vercel/postgres';
export { sql };

export async function ensureSchema() {
  await sql/*sql*/`
    create extension if not exists pgcrypto;
    create table if not exists events (
      id uuid primary key default gen_random_uuid(),
      kind text not null check (kind in ('generate','publish')),
      created_at timestamptz not null default now()
    );
    create index if not exists idx_events_created_at on events (created_at desc);
    create index if not exists idx_events_kind on events (kind);
  `;
}
