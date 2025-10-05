import React from 'react';
type Props = { label: string; value: number | string; hint?: string; };
export default function KpiCard({ label, value, hint }: Props) {
  return (
    <div className="rounded-2xl shadow-sm border p-4 bg-white">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-400">{hint}</div> : null}
    </div>
  );
}
