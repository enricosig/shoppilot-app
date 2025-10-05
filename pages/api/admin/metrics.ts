import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { sql } from '../../../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const days = Math.max(1, Math.min(Number(req.query.days ?? 30), 90)); // 1..90

    // ---- series giornaliera
    const { rows: agg } = await sql/*sql*/`
      with days as (
        select generate_series(date_trunc('day', now()) - interval '${days - 1} days',
                               date_trunc('day', now()),
                               interval '1 day')::date as d
      ),
      counts as (
        select date_trunc('day', created_at)::date as d, kind, count(*)::int as c
        from events
        where created_at >= now() - interval '${days} days'
        group by 1,2
      )
      select d.d as day,
             coalesce(sum(case when c.kind='generate' then c.c end),0)::int as generate,
             coalesce(sum(case when c.kind='publish'  then c.c end),0)::int as publish
      from days d
      left join counts c on c.d = d.d
      group by d.d
      order by d.d asc;
    `;

    const totals = agg.reduce(
      (acc: any, r: any) => ({ generate: acc.generate + r.generate, publish: acc.publish + r.publish }),
      { generate: 0, publish: 0 }
    );

    const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
    const activeSubs = subs.data.length;

    const v = process.env.SHOPIFY_API_VERSION || '2025-01';
    const shop = process.env.SHOPIFY_SHOP;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;
    let products: any[] = [];
    if (shop && token) {
      const r = await fetch(
        `https://${shop}.myshopify.com/admin/api/${v}/products.json?limit=5&fields=id,title,updated_at,handle`,
        { headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' } }
      );
      if (r.ok) {
        const pj = await r.json();
        products = (pj.products || []).map((p: any) => ({
          id: p.id, title: p.title, updated_at: p.updated_at, handle: p.handle,
        }));
      }
    }

    res.status(200).json({
      ok: true,
      metrics: {
        days,
        totals,
        series30d: agg, // lasciamo il nome per compatibilità UI, ma è “seriesXd”
        stripe_active_subscriptions: activeSubs,
        shopify_recent_products: products,
      },
    });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'metrics error' });
  }
}
