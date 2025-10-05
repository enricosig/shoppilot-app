'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AreaSpark from '../../components/AreaSpark';
import KpiCard from '../../components/KpiCard';

type DailyPoint = { date: string; value: number };
type Metrics = {
  revenue?: number;
  orders?: number;
  aov?: number;
  conversion?: number;
  series?: DailyPoint[];       // per sparkline
};

type EventsRow = Record<string, string | number | null | undefined>;

const DAYS_CHOICES = [7, 30, 90] as const;

export default function AdminPage() {
  const [days, setDays] = useState<(typeof DAYS_CHOICES)[number]>(30);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // -------- Fetch METRICS --------
  useEffect(() => {
    let abort = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/admin/metrics?days=${days}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`metrics ${res.status}`);
        const data = await res.json();
        if (!abort) setMetrics(data as Metrics);
      } catch (e: any) {
        if (!abort) setErr(e?.message || 'metrics error');
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [days]);

  // -------- CSV EXPORT --------
  const onExportCsv = async () => {
    try {
      const res = await fetch(`/api/admin/events?days=${days}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`events ${res.status}`);
      const rows = (await res.json()) as EventsRow[];

      if (!rows?.length) {
        alert('Nessun dato da esportare');
        return;
      }

      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(','),
        ...rows.map(r =>
          headers
            .map(h => {
              const v = r[h];
              // CSV-safe
              const s = v == null ? '' : String(v);
              return `"${s.replaceAll('"', '""')}"`;
            })
            .join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shoppilot-events-${days}d.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message || 'CSV export error');
    }
  };

  const series = useMemo<DailyPoint[]>(
    () => metrics?.series ?? [],
    [metrics]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-semibold">Shoppilot</Link>
          <span className="rounded-full bg-black/80 px-2 py-0.5 text-xs text-white">Admin</span>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/billing" className="text-sm underline">Billing</Link>
          <Link href="/privacy" className="text-sm underline">Privacy</Link>
          <button
            onClick={() => setDays(d => d)} // noop, ma mantiene il tasto al layout
            className="rounded-md border px-3 py-1 text-sm"
            disabled={loading}
            title="Refresh"
          >
            ↻ Refresh
          </button>
          <button
            onClick={onExportCsv}
            className="rounded-md bg-black px-3 py-1 text-sm text-white hover:bg-black/90"
            disabled={loading}
          >
            Export CSV
          </button>
        </nav>
      </header>

      {/* Filtri */}
      <div className="mb-5 flex gap-2">
        {DAYS_CHOICES.map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-md border px-3 py-1 text-sm ${
              d === days ? 'bg-black text-white' : 'hover:bg-black/5'
            }`}
            disabled={loading}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Stato */}
      {err && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* KPI */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Revenue"
          value={metrics?.revenue ?? 0}
          loading={loading}
          format="currency"
        />
        <KpiCard
          title="Orders"
          value={metrics?.orders ?? 0}
          loading={loading}
          format="integer"
        />
        <KpiCard
          title="AOV"
          value={metrics?.aov ?? 0}
          loading={loading}
          format="currency"
        />
        <KpiCard
          title="Conversion"
          value={metrics?.conversion ?? 0}
          loading={loading}
          format="percent"
        />
      </section>

      {/* Sparkline / Trend */}
      <section className="rounded-2xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-medium">Revenue trend (last {days}d)</h3>
          {loading && <span className="text-sm text-gray-500">loading…</span>}
        </div>
        <AreaSpark
          data={series.map(p => ({ x: p.date, y: p.value }))}
          height={120}
        />
      </section>
    </div>
  );
}
