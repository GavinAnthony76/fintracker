import type { Frequency } from '@/types/models';

export const frequencyMultipliers: Record<Frequency, number> = {
  daily: 30.44,
  weekly: 4.33,
  'bi-weekly': 2.17,
  'semi-monthly': 2,
  monthly: 1,
  quarterly: 1 / 3,
  annually: 1 / 12,
  'one-time': 0,
};

export function calculateNetWorth(
  assets: { currentValue: number }[],
  liabilities: { currentBalance: number }[]
): number {
  const totalAssets = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.currentBalance, 0);
  return totalAssets - totalLiabilities;
}

export function monthlyEquivalent(amount: number, frequency: Frequency): number {
  return amount * frequencyMultipliers[frequency];
}

export function calculateCashFlow(
  incomes: { amount: number; frequency: Frequency; isActive: boolean }[],
  expenses: { amount: number; frequency: Frequency; isActive: boolean }[]
): number {
  const monthlyIncome = incomes
    .filter((i) => i.isActive)
    .reduce((sum, i) => sum + monthlyEquivalent(i.amount, i.frequency), 0);

  const monthlyExpense = expenses
    .filter((e) => e.isActive)
    .reduce((sum, e) => sum + monthlyEquivalent(e.amount, e.frequency), 0);

  return monthlyIncome - monthlyExpense;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
