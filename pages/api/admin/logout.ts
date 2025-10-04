import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Set-Cookie', `admin_token=; HttpOnly; Path=/; Secure; SameSite=Lax; Max-Age=0`);
  return res.status(200).json({ ok:true });
}
