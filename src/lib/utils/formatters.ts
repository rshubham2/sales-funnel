// src/lib/utils/formatters.ts
export function formatIndianRupees(amount: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  });
  return formatter.format(amount);
}