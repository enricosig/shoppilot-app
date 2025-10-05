import React from 'react';
import useSWR from 'swr';
import KpiCard from '../../components/KpiCard';
import dynamic from 'next/dynamic';

const AreaSpark = dynamic(() => import('../../components/AreaSpark'), { ssr: false });
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/admin/metrics', fetcher, {
    refreshInterval: 15000, // auto-refresh 15s
  });

  const m = data?.metrics;
  const totalsGenerate = m?.totals?.generate ?? 0;
  const totalsPublish  = m?.totals?.publish ?? 0;
  const activeSubs     = m?.stripe_active_subscriptions ?? 0;
  const series         = m?.series30d ?? [];
  const products       = m?.shopify_recent_products ?? [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shoppilot Admin</h1>
        <button
          onClick={() => mutate()}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </header>

      {error && (
        <div className="rounded-xl border p-4 bg-red-50 text-red-700">
          Error loading metrics: {String(error)}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Generations (30d)" value={totalsGenerate} />
        <KpiCard label="Publishes (30d)" value={totalsPublish} />
        <KpiCard label="Stripe Active Subs" value={activeSubs} />
      </div>

      <AreaSpark data={series} />

      <div className="rounded-2xl shadow-sm border p-4 bg-white">
        <div className="text-sm text-gray-500 mb-2">Recent Shopify products</div>
        <div className="divide-y">
          {products.length === 0 && (
            <div className="text-sm text-gray-400">No products or Shopify env missing.</div>
          )}
          {products.map((p: any) => (
            <div key={p.id} className="py-2 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">{p.title}</div>
                <div className="text-gray-500">{p.handle}</div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(p.updated_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
