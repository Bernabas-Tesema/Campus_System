export function formatBirr(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Br 0.00';

  try {
    // In most browsers this formats as "Br" for ETB.
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `Br ${amount.toFixed(2)}`;
  }
}
