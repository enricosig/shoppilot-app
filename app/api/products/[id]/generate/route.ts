import { shopifyGet, type ShopifyProduct } from "@/lib/shopify";
import { productPrompt } from "@/lib/prompt";
import { generateProductCopy } from "@/lib/ai";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { tone = "neutro", lang = "it" } = await req.json().catch(() => ({}));
  const { product } = await shopifyGet<ShopifyProduct>(`/products/${params.id}.json`);
  const prompt = productPrompt({
    title: product.title,
    body: product.body_html,
    vendor: product.vendor,
    product_type: product.product_type,
    lang,
    tone,
  });
  const result = await generateProductCopy(prompt);
  return Response.json({ ok: true, result });
}
