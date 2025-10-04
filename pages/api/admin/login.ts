import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

function hash(k: string) {
  return crypto.createHash('sha256').update(k).digest('hex');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).end();
    const { key } = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const adminKey = process.env.ADMIN_KEY || '';
    if (!adminKey || key !== adminKey) return res.status(401).json({ ok:false });

    // HttpOnly cookie con hash dell’ADMIN_KEY
    res.setHeader('Set-Cookie', [
      `admin_token=${hash(adminKey)}; HttpOnly; Path=/; Secure; SameSite=Lax; Max-Age=2592000`, // 30 giorni
    ]);
    return res.status(200).json({ ok:true });
  } catch (e:any) {
    return res.status(500).json({ ok:false, error: e?.message || 'error' });
  }
}
