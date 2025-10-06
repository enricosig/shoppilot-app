const EUR_FORMAT = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
export function fmtCurrency(n: number): string {
  return EUR_FORMAT.format(n).replace(/\u00A0/g, ' ');
}
const NUM_FORMAT = new Intl.NumberFormat('it-IT');
export function fmtNumber(n: number): string {
  return NUM_FORMAT.format(n).replace(/\u00A0/g, ' ');
}
export function fmtPercent(ratio: number): string {
  const v = Math.round((ratio || 0) * 100);
  return `${v}%`;
}
