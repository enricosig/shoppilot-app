import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// ✅ Versione compatibile con tutte le release del pacchetto Stripe
// Non specifica apiVersion per evitare errori di tipo
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Recupera il prezzo e l’URL dell’app
    const price = process.env.STRIPE_PRICE_ID;
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    // Se manca il prezzo, ritorna errore
    if (!price) {
      return res.status(500).json({ error: 'Missing STRIPE_PRICE_ID' });
    }

    // ✅ Crea una sessione di checkout per abbonamento
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: `${appUrl}/billing?success=1`,
      cancel_url: `${appUrl}/billing?canceled=1`,
    });

    // Restituisce l’URL generato da Stripe
    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.error('Stripe checkout error:', e);
    return res.status(500).json({ error: e?.message || 'stripe error' });
  }
}

