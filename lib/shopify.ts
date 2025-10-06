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
    cache: 'no-store',
    next: { revalidate: 0 },
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

/** Chiamata GraphQL Admin */
export async function shopifyGraphQL<T>(query: string, variables?: Record<string, any>) {
  const r = await fetch(`${base}/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (!r.ok || j.errors) {
    const msg = j.errors ? JSON.stringify(j.errors) : r.statusText;
    throw new Error(`Shopify GraphQL error: ${msg}`);
  }
  return j.data as T;
}

/** Converte gid://shopify/Product/123456 → "123456" */
export function gidToId(gid: string): string {
  const parts = gid?.split('/') ?? [];
  return parts[parts.length - 1] || gid;
}

export type ShopifyProduct = {
  product: {
    id: number;
    title: string;
    body_html: string | null;
    tags?: string;
    handle: string;
    vendor?: string;
    product_type?: string;
    variants: Array<{ id: number; price: string }>;
    images: Array<{ id: number; src: string }>;
  };
};
