// lib/shopify.ts
const SHOP = process.env.SHOPIFY_SHOP!;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';

if (!SHOP || !TOKEN) throw new Error('Missing Shopify env');

const base = `https://${SHOP}/admin/api/${API_VERSION}`;

export async function shopifyGet<T>(path: string) {
  const r = await fetch(`${base}${path}`, {
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json',
    },
    // Usa SOLO uno dei due per evitare il warning di Next:
    cache: 'no-store',
    // rimosso: next: { revalidate: 0 },
  });
  if (!r.ok) throw new Error(`Shopify GET ${path} ${r.status}`);
  return (await r.json()) as T;
}

export async function shopifyPut<T>(path: string, body: any) {
  const r = await fetch(`${base}${path}`, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Shopify PUT ${path} ${r.status}: ${txt}`);
  }
  return (await r.json()) as T;
}

// --- opzionale: GraphQL e conversione GID→ID già usati in /api/products/search ---
export async function shopifyGraphQL<T>(query: string, variables?: Record<string, any>) {
  const r = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Shopify GraphQL ${r.status}: ${txt}`);
  }
  const data = await r.json();
  if (data.errors) {
    throw new Error(`Shopify GraphQL errors: ${JSON.stringify(data.errors)}`);
  }
  return data.data as T;
}

export function gidToId(gid: string): string {
  // es: gid://shopify/Product/123456789 -> 123456789
  const m = gid?.match(/\/(\d+)$/);
  return m ? m[1] : gid;
}
