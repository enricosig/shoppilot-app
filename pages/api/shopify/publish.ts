import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../../lib/db'; // usa @vercel/postgres

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const shop = process.env.SHOPIFY_SHOP;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;
    const version = process.env.SHOPIFY_API_VERSION || '2025-01';
    if (!shop || !token) return res.status(500).json({ ok: false, error: 'Missing Shopify env' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const productId = Number(body.productId);
    const description = String(body.description || '');
    if (!productId || !description) return res.status(400).json({ ok: false, error: 'Missing productId/description' });

    const url = `https://${shop}.myshopify.com/admin/api/${version}/products/${productId}.json`;
    const resp = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ product: { id: productId, body_html: description } }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(500).json({ ok: false, error: `Shopify: ${txt}` });
    }

    // log evento (best-effort)
    try { await sql`insert into events(kind) values('publish')`; } catch {}

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'error' });
  }
}
