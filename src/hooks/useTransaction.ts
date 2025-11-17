import { useState, useCallback, useEffect } from 'react';
import { db } from '@/db/dexie';
import { Transaction } from '@/types/models';

interface UseTransactionResult {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export function useTransaction(): UseTransactionResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.transactions.toArray();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const now = new Date().toISOString();
        const newTransaction: Transaction = {
          ...transaction,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        await db.transactions.add(newTransaction);
        // Reload all transactions to ensure UI is in sync
        await loadTransactions();
      } catch (error) {
        console.error('Failed to add transaction:', error);
        throw error;
      }
    },
    [loadTransactions]
  );

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      const updated = { ...updates, updatedAt: new Date().toISOString() };
      await db.transactions.update(id, updated);
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, ...updated } : tx))
      );
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await db.transactions.delete(id);
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  }, []);

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction };
}
