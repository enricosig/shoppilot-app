import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabaseAnon } from '@/lib/supabaseServer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: (process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion) || '2023-10-16',
});

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1) Supabase: conteggio generazioni ultimi 30 giorni
    const supa = supabaseAnon();
    const { data: counts, error: e1 } = await supa
      .from('events')
      .select('kind, count:count(*)')
      .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString())
      .group('kind');

    if (e1) throw e1;

    const genCount = (counts || []).find(r => r.kind === 'generate')?.count || 0;
    const pubCount = (counts || []).find(r => r.kind === 'publish')?.count || 0;

    // 2) Stripe: abbonamenti attivi
    const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
    const activeSubs = subs.data.length;

    // 3) Shopify: ultimi 5 prodotti (id, title, updated_at)
    const v = process.env.SHOPIFY_API_VERSION || '2025-01';
    const shop = process.env.SHOPIFY_SHOP;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;
    const r = await fetch(`https://${shop}.myshopify.com/admin/api/${v}/products.json?limit=5&fields=id,title,updated_at,handle`, {
      headers: { 'X-Shopify-Access-Token': token || '', 'Content-Type': 'application/json' },
    });
    const pj = await r.json();
    const products = (pj.products || []).map((p: any) => ({
      id: p.id, title: p.title, updated_at: p.updated_at, handle: p.handle,
    }));

    res.status(200).json({
      ok: true,
      metrics: {
        openai_generations_30d: genCount,
        shopify_publishes_30d: pubCount,
        stripe_active_subscriptions: activeSubs,
        shopify_recent_products: products,
      },
    });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'metrics error' });
  }
}
