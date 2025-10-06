// app/admin/page.tsx
import { fmtCurrency, fmtNumber, fmtPercent } from '@/lib/format';
import KpiCard from '@/components/KpiCard';

export default async function AdminPage() {
  // 🔹 Simula valori (sostituisci con query reali se vuoi)
  const metrics = {
    revenue: 12345,
    orders: 74,
    aov: 166.9,
    conversion: 0.024,
  };

  // 🔹 Prepara stringhe già formattate (server-side)
  const kpis = [
    { title: 'Revenue', value: fmtCurrency(metrics.revenue) },
    { title: 'Orders', value: fmtNumber(metrics.orders) },
    { title: 'AOV', value: fmtCurrency(metrics.aov) },
    { title: 'Conversion', value: fmtPercent(metrics.conversion) },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Shoppilot Admin</h1>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </section>
    </div>
  );
}
