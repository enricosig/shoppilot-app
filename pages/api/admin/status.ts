import type { NextApiRequest, NextApiResponse } from 'next';

// Nota: keep it lightweight (ping non invasivi)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const out = { ok: true, openai: '', stripe: '', shopify: '' as string, error: '' as string };

  try {
    // OpenAI (list models lightweight)
    try {
      const r = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
      });
      out.openai = r.ok ? 'OK' : `ERR ${r.status}`;
      if (!r.ok) out.ok = false;
    } catch (e:any) { out.openai = 'ERR'; out.ok = false; }

    // Stripe (list prices)
    try {
      const r = await fetch('https://api.stripe.com/v1/prices', {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
      });
      out.stripe = r.ok ? 'OK' : `ERR ${r.status}`;
      if (!r.ok) out.ok = false;
    } catch (e:any) { out.stripe = 'ERR'; out.ok = false; }

    // Shopify (light ping)
    try {
      const v = process.env.SHOPIFY_API_VERSION || '2025-01';
      const url = `https://${process.env.SHOPIFY_SHOP}.myshopify.com/admin/api/${v}/shop.json`;
      const r = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN || '',
          'Content-Type': 'application/json',
        }
      });
      out.shopify = r.ok ? 'OK' : `ERR ${r.status}`;
      if (!r.ok) out.ok = false;
    } catch (e:any) { out.shopify = 'ERR'; out.ok = false; }

    return res.status(200).json(out);
  } catch (e:any) {
    return res.status(500).json({ ok:false, openai:'', stripe:'', shopify:'', error: e?.message || 'error' });
  }
}
