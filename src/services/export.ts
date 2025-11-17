import { db } from '@/db/dexie';
import { Income, Expense, Transaction, Asset, Liability } from '@/types/models';

interface ExportData {
  exportedAt: string;
  incomes: Income[];
  expenses: Expense[];
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
}

/**
 * Export all financial data as JSON
 */
export async function exportAsJSON(): Promise<string> {
  const [incomes, expenses, transactions, assets, liabilities] = await Promise.all([
    db.incomes.toArray(),
    db.expenses.toArray(),
    db.transactions.toArray(),
    db.assets.toArray(),
    db.liabilities.toArray(),
  ]);

  const exportData: ExportData = {
    exportedAt: new Date().toISOString(),
    incomes,
    expenses,
    transactions,
    assets,
    liabilities,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export income/expense data as CSV
 */
export async function exportAsCSV(): Promise<string> {
  const [incomes, expenses] = await Promise.all([db.incomes.toArray(), db.expenses.toArray()]);

  let csv = 'Type,Name,Amount,Frequency,Category,Status,Start Date,End Date,Notes\n';

  // Add incomes
  incomes.forEach((income) => {
    const row = [
      'Income',
      `"${income.name}"`,
      income.amount,
      income.frequency,
      `"${income.category}"`,
      income.isActive ? 'Active' : 'Inactive',
      income.startDate,
      income.endDate || '',
      `"${income.notes || ''}"`,
    ].join(',');
    csv += row + '\n';
  });

  // Add expenses
  expenses.forEach((expense) => {
    const row = [
      'Expense',
      `"${expense.name}"`,
      expense.amount,
      expense.frequency,
      `"${expense.category}"`,
      expense.isActive ? 'Active' : 'Inactive',
      expense.dueDate || '',
      '',
      `"${expense.notes || ''}"`,
    ].join(',');
    csv += row + '\n';
  });

  return csv;
}

/**
 * Export net worth data as CSV
 */
export async function exportNetWorthAsCSV(): Promise<string> {
  const [assets, liabilities] = await Promise.all([
    db.assets.toArray(),
    db.liabilities.toArray(),
  ]);

  let csv = 'Type,Name,Value/Balance,Category,Interest Rate,Monthly Payment,Valuation/Update Date,Notes\n';

  // Add assets
  assets.forEach((asset) => {
    const row = [
      'Asset',
      `"${asset.name}"`,
      asset.currentValue,
      asset.type,
      '',
      '',
      asset.valuationDate,
      `"${asset.notes || ''}"`,
    ].join(',');
    csv += row + '\n';
  });

  // Add liabilities
  liabilities.forEach((liability) => {
    const row = [
      'Liability',
      `"${liability.name}"`,
      liability.currentBalance,
      liability.type,
      liability.interestRate || '',
      liability.monthlyPayment || '',
      new Date().toISOString().split('T')[0],
      `"${liability.notes || ''}"`,
    ].join(',');
    csv += row + '\n';
  });

  return csv;
}

/**
 * Trigger file download
 */
export function downloadFile(content: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
