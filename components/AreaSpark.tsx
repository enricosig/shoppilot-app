'use client';

import React, { useMemo } from 'react';

export type SparkPoint = { x: string; y: number };

type Props = {
  data: SparkPoint[];
  height?: number;
  strokeWidth?: number;
  className?: string;
};

/**
 * AreaSpark: mini area chart responsive (SVG) senza dipendenze.
 * Accetta data come [{x, y}], riempie con gradiente e disegna linea.
 */
export default function AreaSpark({
  data,
  height = 120,
  strokeWidth = 2,
  className,
}: Props) {
  const { path, area, minY, maxY } = useMemo(() => {
    if (!data?.length) {
      return { path: '', area: '', minY: 0, maxY: 1 };
    }

    const ys = data.map((d) => (Number.isFinite(d.y) ? d.y : 0));
    let minY = Math.min(...ys);
    let maxY = Math.max(...ys);
    if (minY === maxY) {
      // evita divisione per zero: allarga leggermente il range
      minY = minY - 1;
      maxY = maxY + 1;
    }

    const padX = 8;
    const padY = 8;
    const w = Math.max(1, data.length - 1); // rapporto per normalizzare X
    const H = height - padY * 2;

    const scaleX = (i: number) =>
      padX + (i / w) * (100 - padX * 2); // usiamo un viewBox 0..100 per la larghezza
    const scaleY = (v: number) =>
      padY + (1 - (v - minY) / (maxY - minY)) * H;

    let d = '';
    data.forEach((p, i) => {
      const x = scaleX(i);
      const y = scaleY(p.y);
      d += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
    });

    const firstX = scaleX(0);
    const lastX = scaleX(data.length - 1);
    const baseline = padY + H;

    const area = `${d} L ${lastX},${baseline} L ${firstX},${baseline} Z`;

    return { path: d, area, minY, maxY };
  }, [data, height]);

  if (!data?.length) {
    return (
      <div
        className={`flex h-[${height}px] items-center justify-center rounded-2xl border text-sm text-gray-500 ${className || ''}`}
      >
        No data
      </div>
    );
  }

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 100 ${height}`}
        role="img"
        aria-label={`Trend min ${minY} max ${maxY}`}
        className="w-full"
      >
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* area */}
        <path d={area} fill="url(#sparkFill)" vectorEffect="non-scaling-stroke" />

        {/* line */}
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
