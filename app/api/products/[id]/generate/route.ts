// app/api/products/[id]/generate/route.ts
import { shopifyGet } from "@/lib/shopify";
import { productPrompt } from "@/lib/prompt";
import { generateProductCopy } from "@/lib/ai";

// Tipo locale, così non dipendiamo da lib/shopify.ts
type ShopifyProduct = {
  product: {
    id: number;
    title: string;
    body_html: string | null;
    vendor?: string;
    product_type?: string;
  };
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { tone = "neutro", lang = "it" } = await req.json().catch(() => ({}));

  const data = await shopifyGet<ShopifyProduct>(`/products/${params.id}.json`);
  const product = data.product;

  const prompt = productPrompt({
    title: product.title,
    body: product.body_html,
    vendor: product.vendor,
    product_type: product.product_type,
    lang,
    tone,
  });

  // usa la versione “strict JSON” già corretta del tuo lib/ai.ts
  const result = await generateProductCopy(prompt);

  return Response.json({ ok: true, result });
}
