// components/KpiCard.tsx
'use client';
import React from 'react';

export default function KpiCard({
  title,
  value,
  footer,
  loading = false,
}: {
  title: string;
  value: string;
  footer?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border p-4 shadow-sm bg-white dark:bg-neutral-900">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">
        {loading ? '—' : value}
      </div>
      {footer && <div className="mt-1 text-xs text-gray-400">{footer}</div>}
    </div>
  );
}
