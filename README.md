
# Shoppilot App (Scenario 2)

Next.js 14 app with:
- OpenAI product description generator
- Stripe Checkout (subscription)
- Shopify product update
- Simple dashboard

## ENV (Vercel → Settings → Environment Variables)
OPENAI_API_KEY=...
ADMIN_KEY=change-this
NEXT_PUBLIC_APP_NAME=Shoppilot
APP_URL=https://app.shoppilot.ai

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...

# Shopify
SHOPIFY_SHOP=your-shop (without .myshopify.com)
SHOPIFY_ADMIN_TOKEN=shpat_...
SHOPIFY_API_VERSION=2024-07

## Dev
npm install
npm run dev
