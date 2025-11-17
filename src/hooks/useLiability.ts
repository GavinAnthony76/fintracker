import { useState, useCallback, useEffect } from 'react';
import { db } from '@/db/dexie';
import { Liability } from '@/types/models';

interface UseLiabilityResult {
  liabilities: Liability[];
  loading: boolean;
  addLiability: (liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLiability: (id: string, liability: Partial<Liability>) => Promise<void>;
  deleteLiability: (id: string) => Promise<void>;
}

export function useLiability(): UseLiabilityResult {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLiabilities();
  }, []);

  const loadLiabilities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.liabilities.toArray();
      setLiabilities(data);
    } catch (error) {
      console.error('Failed to load liabilities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addLiability = useCallback(
    async (liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const now = new Date().toISOString();
        const newLiability: Liability = {
          ...liability,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        await db.liabilities.add(newLiability);
        setLiabilities((prev) => [...prev, newLiability]);
      } catch (error) {
        console.error('Failed to add liability:', error);
        throw error;
      }
    },
    []
  );

  const updateLiability = useCallback(async (id: string, updates: Partial<Liability>) => {
    try {
      const updated = { ...updates, updatedAt: new Date().toISOString() };
      await db.liabilities.update(id, updated);
      setLiabilities((prev) =>
        prev.map((liability) => (liability.id === id ? { ...liability, ...updated } : liability))
      );
    } catch (error) {
      console.error('Failed to update liability:', error);
      throw error;
    }
  }, []);

  const deleteLiability = useCallback(async (id: string) => {
    try {
      await db.liabilities.delete(id);
      setLiabilities((prev) => prev.filter((liability) => liability.id !== id));
    } catch (error) {
      console.error('Failed to delete liability:', error);
      throw error;
    }
  }, []);

  return { liabilities, loading, addLiability, updateLiability, deleteLiability };
}
