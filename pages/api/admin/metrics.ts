import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { sql } from '../../../lib/db'; // usa il tuo helper che re-exporta `sql` da @vercel/postgres

// Niente apiVersion: evitiamo mismatch con i tipi
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    // --- 1) Postgres: conteggi ultimi 30 giorni
    const { rows: countRows } = await sql/*sql*/`
      select kind, count(*)::int as count
      from events
      where created_at >= now() - interval '30 days'
      group by kind
    `;
    const genCount = countRows.find(r => r.kind === 'generate')?.count ?? 0;
    const pubCount = countRows.find(r => r.kind === 'publish')?.count ?? 0;

    // --- 2) Stripe: abbonamenti attivi
    const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
    const activeSubs = subs.data.length;

    // --- 3) Shopify: ultimi 5 prodotti (id, title, updated_at, handle)
    const v = process.env.SHOPIFY_API_VERSION || '2025-01';
    const shop = process.env.SHOPIFY_SHOP;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;
    if (!shop || !token) {
      return res.status(500).json({ ok: false, error: 'Missing SHOPIFY_SHOP / SHOPIFY_ADMIN_TOKEN' });
    }

    const r = await fetch(
      `https://${shop}.myshopify.com/admin/api/${v}/products.json?limit=5&fields=id,title,updated_at,handle`,
      { headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' } }
    );

    if (!r.ok) {
      const txt = await r.text();
      return res.status(500).json({ ok: false, error: `Shopify: ${txt}` });
    }

    const pj = await r.json();
    const products = (pj.products || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      updated_at: p.updated_at,
      handle: p.handle,
    }));

    return res.status(200).json({
      ok: true,
      metrics: {
        openai_generations_30d: genCount,
        shopify_publishes_30d: pubCount,
        stripe_active_subscriptions: activeSubs,
        shopify_recent_products: products,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'metrics error' });
  }
}
