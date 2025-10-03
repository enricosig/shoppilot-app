
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const shop = process.env.SHOPIFY_SHOP;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;
    const version = process.env.SHOPIFY_API_VERSION || '2024-07';
    if (!shop || !token) return res.status(500).json({ ok:false, error:'Missing Shopify env' });

    const { productId, description } = JSON.parse(req.body || '{}');
    if (!productId || !description) return res.status(400).json({ ok:false, error:'Missing productId/description' });

    const url = `https://${shop}.myshopify.com/admin/api/${version}/products/${productId}.json`;
    const r = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({ product: { id: productId, body_html: description } })
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(500).json({ ok:false, error:`Shopify: ${txt}` });
    }
    res.status(200).json({ ok:true });
  } catch (e:any) {
    res.status(500).json({ ok:false, error: e?.message || 'error' });
  }
}
