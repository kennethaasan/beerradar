export function formatNumber(number: number, decimals = 2): number {
  return parseFloat(number.toFixed(decimals));
}
