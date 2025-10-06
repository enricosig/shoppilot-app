import { shopifyGet, type ShopifyProduct } from "@/lib/shopify";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    // sanity check
    if (!params?.id || !/^\d+$/.test(params.id)) {
      return Response.json({ error: "invalid product id" }, { status: 400 });
    }

    const data = await shopifyGet<ShopifyProduct>(`/products/${params.id}.json`);
    // Shopify risponde sempre { product: {...} }
    if (!data?.product) {
      return Response.json({ error: "product not found" }, { status: 404 });
    }
    return Response.json(data.product, { status: 200 });
  } catch (err: any) {
    // assicuriamoci di tornare SEMPRE JSON
    const msg = err?.message || "Shopify fetch error";
    // log lato server
    console.error("[GET /api/products/:id] error:", msg);
    // 502 per errori a valle (Shopify, rete, token, ecc.)
    return Response.json({ error: msg }, { status: 502 });
  }
}
