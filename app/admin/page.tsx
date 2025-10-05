import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const AreaSpark = dynamic(() => import('@/components/AreaSpark'), { ssr: false });

export const metadata: Metadata = {
  title: 'Shoppilot — Admin',
  description: 'Metrics and events',
};

async function fetchJSON(path: string) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

export default async function AdminPage({ searchParams }: { searchParams: { days?: string } }) {
  const days = Number(searchParams?.days ?? 30);
  const d = Math.max(1, Math.min(days || 30, 365));

  // Server-side fetch (no-store) degli stessi endpoint pages/api/*
  const data = await fetchJSON(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/metrics?days=${d}`);
  const m = data?.metrics ?? {};
  const totalsGenerate = m?.totals?.generate ?? 0;
  const totalsPublish  = m?.totals?.publish ?? 0;
  const activeSubs     = m?.stripe_active_subscriptions ?? 0;
  const series         = m?.series30d ?? [];
  const products       = m?.shopify_recent_products ?? [];

  const mkUrl = (n: number) => `/admin?days=${n}`;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shoppilot Admin</h1>
        <div className="flex gap-2">
          <div className="flex rounded-xl border overflow-hidden">
            {[7,30,90].map((r) => (
              <Link key={r} href={mkUrl(r)}
                className={`px-3 py-2 text-sm ${d===r ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}>
                {r}d
              </Link>
            ))}
          </div>
          <Link href={mkUrl(d)} className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">Refresh</Link>
          <a
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            href={`/api/admin/events?days=${d}&format=csv`}
          >
            Export CSV
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Kpi label={`Generations (${d}d)`} value={totalsGenerate} />
        <Kpi label={`Publishes (${d}d)`} value={totalsPublish} />
        <Kpi label="Stripe Active Subs" value={activeSubs} />
      </div>

      <AreaSpark data={series} />

      <div className="rounded-2xl shadow-sm border p-4 bg-white">
        <div className="text-sm text-gray-500 mb-2">Recent Shopify products</div>
        <div className="divide-y">
          {products.length === 0 && <div className="text-sm text-gray-400">No products or Shopify env missing.</div>}
          {products.map((p: any) => (
            <div key={p.id} className="py-2 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">{p.title}</div>
                <div className="text-gray-500">{p.handle}</div>
              </div>
              <div className="text-xs text-gray-500">{new Date(p.updated_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-2xl shadow-sm border p-4 bg-white">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-400">{hint}</div> : null}
    </div>
  );
}
