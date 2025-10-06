const SHOP = process.env.SHOPIFY_SHOP!;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

if (!SHOP || !TOKEN) throw new Error("Missing Shopify env");

const base = `https://${SHOP}/admin/api/${API_VERSION}`;

/**
 * REST: GET wrapper
 */
export async function shopifyGet<T = any>(path: string): Promise<T> {
  const r = await fetch(`${base}${path}`, {
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!r.ok) throw new Error(`Shopify GET ${path} ${r.status}`);
  return (await r.json()) as T;
}

/**
 * REST: PUT wrapper
 */
export async function shopifyPut<T = any>(path: string, body: any): Promise<T> {
  const r = await fetch(`${base}${path}`, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Shopify PUT ${path} ${r.status}: ${txt}`);
  }
  return (await r.json()) as T;
}

/**
 * GraphQL: POST wrapper (Admin API)
 */
export async function shopifyGraphQL<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const r = await fetch(`${base}/graphql.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Shopify GQL ${r.status}: ${txt}`);
  }
  const j = await r.json();
  if (j.errors) {
    throw new Error(`Shopify GQL errors: ${JSON.stringify(j.errors)}`);
  }
  return j.data as T;
}

/**
 * Utility: converte gid://shopify/Product/123456789 -> 123456789
 */
export function gidToId(gid: string): number {
  const last = gid?.split("/")?.pop();
  const n = Number(last);
  if (!Number.isFinite(n)) throw new Error(`Invalid GID: ${gid}`);
  return n;
}

/**
 * Tipo prodotto (shape REST /products/:id.json)
 */
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
