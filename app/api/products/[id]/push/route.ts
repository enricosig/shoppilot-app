// app/api/products/[id]/push/route.ts
import { shopifyPut } from "@/lib/shopify";

type ShopifyProductRes = {
  product: {
    id: number;
    title: string;
    body_html: string | null;
    tags?: string;
  };
};

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json(); // { title?, description_html?, tags?[] }
  const updatePayload: any = { product: { id: Number(params.id) } };

  if (body.title) updatePayload.product.title = body.title;
  if (body.description_html) updatePayload.product.body_html = body.description_html;
  if (Array.isArray(body.tags)) updatePayload.product.tags = body.tags.join(", ");

  const res = await shopifyPut<ShopifyProductRes>(`/products/${params.id}.json`, updatePayload);
  return Response.json({ ok: true, product: res.product });
}
