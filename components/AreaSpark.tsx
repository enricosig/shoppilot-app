'use client';

import React from 'react';

/** Punto opzionale (se vuoi passare coppie x/y) */
export type SparkPoint = { x: string; y: number };

type Props = {
  /** Serie numerica semplice (es. [3,5,2,8]) */
  data?: number[];
  /** Serie come coppie x/y (usa solo y per il grafico) */
  points?: SparkPoint[];
  width?: number;
  height?: number;
  strokeWidth?: number;
};

export default function AreaSpark({
  data,
  points,
  width = 140,
  height = 36,
  strokeWidth = 2,
}: Props) {
  // Normalizza i valori: preferisci `data`, altrimenti prendi y da `points`
  const values: number[] =
    (data && data.length ? data : points?.map(p => p.y)) ?? [];

  if (!values.length) {
    return (
      <svg width={width} height={height} aria-hidden="true" />
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Converte i valori in coordinate SVG
  const stepX = values.length > 1 ? width / (values.length - 1) : width;
  const coords = values.map((v, i) => {
    const x = i * stepX;
    // y invertita (0 in alto), con padding di 1px
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return [x, y] as const;
  });

  // path linea
  const dLine =
    'M ' + coords.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ');

  // path area (sotto la linea)
  const dArea =
    `${dLine} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={dArea} fill="currentColor" opacity="0.12" />
      <path d={dLine} fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  );
}
