'use client';

import React from 'react';
export default function KpiCard({ title, value, footer }: {title:string; value:string; footer?:string}) {
  return (
    <div style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
      <div style={{fontSize:12, color:'#666'}}>{title}</div>
      <div style={{fontSize:24, fontWeight:700}}>{value}</div>
      {footer && <div style={{fontSize:12, color:'#999'}}>{footer}</div>}
    </div>
  );
}

type KpiCardProps = {
  title: string;
  value: number;
  loading?: boolean;
  format?: 'currency' | 'percent' | 'integer' | 'number';
  hint?: string;
};

function formatValue(v: number, format: KpiCardProps['format'] = 'number') {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(v || 0);
    case 'percent':
      return new Intl.NumberFormat(undefined, {
        style: 'percent',
        maximumFractionDigits: 2,
      }).format((v || 0) / 100);
    case 'integer':
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
        Math.round(v || 0),
      );
    default:
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
        v || 0,
      );
  }
}

export default function KpiCard({
  title,
  value,
  loading,
  format = 'number',
  hint,
}: KpiCardProps) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">{title}</span>
        {hint ? <span className="text-xs text-gray-400">{hint}</span> : null}
      </div>

      {loading ? (
        <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
      ) : (
        <div className="text-2xl font-semibold">{formatValue(value, format)}</div>
      )}
    </div>
  );
}
