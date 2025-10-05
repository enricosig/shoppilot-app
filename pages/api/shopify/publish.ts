import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const shop = process.env.SHOPIFY_SHOP;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;
    const version = process.env.SHOPIFY_API_VERSION || '2025-01';
    if (!shop || !token)
      return res.status(500).json({ ok: false, error: 'Missing Shopify env' });

    // ✅ Supporta sia JSON string (curl) che oggetto (Next.js)
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : (req.body || {});
    const productId = Number(body.productId);
    const description = String(body.description || '');

    if (!productId || !description) {
      return res
        .status(400)
        .json({ ok: false, error: 'Missing productId/description' });
    }

    // 🔹 Costruisci URL API Shopify
    const url = `https://${shop}.myshopify.com/admin/api/${version}/products/${productId}.json`;

    // 🔹 Esegui PUT verso Shopify
    const r = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        product: { id: productId, body_html: description },
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return res
        .status(500)
        .json({ ok: false, error: `Shopify: ${txt}` });
    }

    // ✅ Traccia evento in Supabase (publish)
    try {
      const supa = supabaseAdmin();
      await supa.from('events').insert({ kind: 'publish' });
    } catch (err) {
      console.warn('⚠️ Supabase tracking failed:', err);
    }

    // ✅ Risposta OK
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('❌ Publish error:', e);
    return res
      .status(500)
      .json({ ok: false, error: e?.message || 'error' });
  }
}
