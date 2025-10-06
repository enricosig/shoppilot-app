// app/api/products/search/route.ts
import { shopifyGraphQL, gidToId } from "@/lib/shopify";

type GQL = {
  products: {
    edges: Array<{
      cursor: string;
      node: {
        id: string; // GID
        title: string;
        handle: string;
        status: string;
        createdAt: string;
        featuredImage?: { url: string | null } | null;
      };
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

const QUERY = `
query Products($q: String!, $first: Int!, $after: String) {
  products(first: $first, after: $after, query: $q) {
    edges {
      cursor
      node {
        id
        title
        handle
        status
        createdAt
        featuredImage { url }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const after = searchParams.get("cursor") || null;
  const first = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);

  if (!q) return Response.json({ items: [], nextCursor: null });

  // usa sintassi di ricerca Shopify es: title:*polo* OR vendor:'nike'
  const data = await shopifyGraphQL<GQL>(QUERY, { q, first, after });

  const items = data.products.edges.map((e) => ({
    id: gidToId(e.node.id),
    title: e.node.title,
    handle: e.node.handle,
    status: e.node.status,
    createdAt: e.node.createdAt,
    image: e.node.featuredImage?.url || null,
  }));

  return Response.json({
    items,
    nextCursor: data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null,
  });
}
