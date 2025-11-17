import { useState, useCallback, useEffect } from 'react';
import { db } from '@/db/dexie';
import { Income } from '@/types/models';

interface UseIncomeResult {
  incomes: Income[];
  loading: boolean;
  addIncome: (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncome: (id: string, income: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
}

export function useIncome(): UseIncomeResult {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.incomes.toArray();
      setIncomes(data);
    } catch (error) {
      console.error('Failed to load incomes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addIncome = useCallback(
    async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const now = new Date().toISOString();
        const newIncome: Income = {
          ...income,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        await db.incomes.add(newIncome);
        // Reload all incomes to ensure UI is in sync
        await loadIncomes();
      } catch (error) {
        console.error('Failed to add income:', error);
        throw error;
      }
    },
    [loadIncomes]
  );

  const updateIncome = useCallback(async (id: string, updates: Partial<Income>) => {
    try {
      const updated = { ...updates, updatedAt: new Date().toISOString() };
      await db.incomes.update(id, updated);
      setIncomes((prev) =>
        prev.map((income) => (income.id === id ? { ...income, ...updated } : income))
      );
    } catch (error) {
      console.error('Failed to update income:', error);
      throw error;
    }
  }, []);

  const deleteIncome = useCallback(async (id: string) => {
    try {
      await db.incomes.delete(id);
      setIncomes((prev) => prev.filter((income) => income.id !== id));
    } catch (error) {
      console.error('Failed to delete income:', error);
      throw error;
    }
  }, []);

  return { incomes, loading, addIncome, updateIncome, deleteIncome };
}
