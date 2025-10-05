import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Non passiamo apiVersion: Stripe userà quella dell'account ed evitiamo errori TS
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const price = process.env.STRIPE_PRICE_ID;
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    if (!price) return res.status(500).json({ error: 'Missing STRIPE_PRICE_ID' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: `${appUrl}/billing?success=1`,
      cancel_url: `${appUrl}/billing?canceled=1`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.error('Stripe checkout error:', e);
    return res.status(500).json({ error: e?.message || 'stripe error' });
  }
}
