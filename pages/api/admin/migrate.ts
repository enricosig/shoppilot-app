// pages/api/admin/migrate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureSchema } from '../../../lib/db';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    await ensureSchema();
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'migrate error' });
  }
}
