// lib/format.ts
// ✅ Helper per formattare numeri e valute in modo coerente lato server/client

const EUR_FORMAT = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function fmtCurrency(n: number): string {
  // sostituisce NBSP (spazio non-breakable) con spazio normale
  return EUR_FORMAT.format(n).replace(/\u00A0/g, ' ');
}

const NUM_FORMAT = new Intl.NumberFormat('it-IT');
export function fmtNumber(n: number): string {
  return NUM_FORMAT.format(n).replace(/\u00A0/g, ' ');
}

export function fmtPercent(ratio: number): string {
  // 0.123 → "12%"
  const v = Math.round((ratio || 0) * 100);
  return `${v}%`;
}
