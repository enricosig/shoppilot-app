// app/api/products/[id]/route.ts
import { shopifyGet } from "@/lib/shopify";

type ShopifyProduct = {
  product: {
    id: number;
    title: string;
    body_html: string | null;
    tags?: string;
    handle: string;
    vendor?: string;
    product_type?: string;
  };
};

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const data = await shopifyGet<ShopifyProduct>(`/products/${params.id}.json`);
  return Response.json(data.product);
}
