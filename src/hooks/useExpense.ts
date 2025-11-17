import { useState, useCallback, useEffect } from 'react';
import { db } from '@/db/dexie';
import { Expense } from '@/types/models';

interface UseExpenseResult {
  expenses: Expense[];
  loading: boolean;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export function useExpense(): UseExpenseResult {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.expenses.toArray();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addExpense = useCallback(
    async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const now = new Date().toISOString();
        const newExpense: Expense = {
          ...expense,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        await db.expenses.add(newExpense);
        // Reload all expenses to ensure UI is in sync
        await loadExpenses();
      } catch (error) {
        console.error('Failed to add expense:', error);
        throw error;
      }
    },
    [loadExpenses]
  );

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    try {
      const updated = { ...updates, updatedAt: new Date().toISOString() };
      await db.expenses.update(id, updated);
      setExpenses((prev) =>
        prev.map((expense) => (expense.id === id ? { ...expense, ...updated } : expense))
      );
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw error;
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await db.expenses.delete(id);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      throw error;
    }
  }, []);

  return { expenses, loading, addExpense, updateExpense, deleteExpense };
}
