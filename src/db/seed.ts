import { db } from './dexie';
import { Income, Expense, Account, Asset } from '@/types/models';

const now = new Date().toISOString();
const startOfMonth = new Date();
startOfMonth.setDate(1);

export async function seedDatabase(): Promise<void> {
  // Check if data already exists
  const incomeCount = await db.incomes.count();
  if (incomeCount > 0) {
    return; // Already seeded
  }

  const defaultAccounts: Account[] = [
    {
      id: 'acc-1',
      name: 'Checking Account',
      type: 'checking',
      institution: 'Bank',
      balance: 5000,
      lastUpdated: now,
      isLinked: false,
    },
    {
      id: 'acc-2',
      name: 'Savings Account',
      type: 'savings',
      institution: 'Bank',
      balance: 10000,
      lastUpdated: now,
      isLinked: false,
    },
  ];

  const defaultIncomes: Income[] = [
    {
      id: 'inc-1',
      name: 'Salary',
      amount: 5000,
      frequency: 'monthly',
      category: 'Employment',
      startDate: startOfMonth.toISOString().split('T')[0],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const defaultExpenses: Expense[] = [
    {
      id: 'exp-1',
      name: 'Rent',
      amount: 1500,
      frequency: 'monthly',
      category: 'Housing',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'exp-2',
      name: 'Groceries',
      amount: 400,
      frequency: 'monthly',
      category: 'Food',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const defaultAssets: Asset[] = [
    {
      id: 'ast-1',
      name: 'Primary Home',
      type: 'property',
      currentValue: 300000,
      valuationDate: now,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await Promise.all([
    db.accounts.bulkAdd(defaultAccounts),
    db.incomes.bulkAdd(defaultIncomes),
    db.expenses.bulkAdd(defaultExpenses),
    db.assets.bulkAdd(defaultAssets),
  ]);
}
