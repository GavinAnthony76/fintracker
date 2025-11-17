import { useState, useCallback, useEffect } from 'react';
import { db } from '@/db/dexie';
import { Asset } from '@/types/models';

interface UseAssetResult {
  assets: Asset[];
  loading: boolean;
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

export function useAsset(): UseAssetResult {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.assets.toArray();
      setAssets(data);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addAsset = useCallback(
    async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const now = new Date().toISOString();
        const newAsset: Asset = {
          ...asset,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        await db.assets.add(newAsset);
        setAssets((prev) => [...prev, newAsset]);
      } catch (error) {
        console.error('Failed to add asset:', error);
        throw error;
      }
    },
    []
  );

  const updateAsset = useCallback(async (id: string, updates: Partial<Asset>) => {
    try {
      const updated = { ...updates, updatedAt: new Date().toISOString() };
      await db.assets.update(id, updated);
      setAssets((prev) =>
        prev.map((asset) => (asset.id === id ? { ...asset, ...updated } : asset))
      );
    } catch (error) {
      console.error('Failed to update asset:', error);
      throw error;
    }
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    try {
      await db.assets.delete(id);
      setAssets((prev) => prev.filter((asset) => asset.id !== id));
    } catch (error) {
      console.error('Failed to delete asset:', error);
      throw error;
    }
  }, []);

  return { assets, loading, addAsset, updateAsset, deleteAsset };
}
