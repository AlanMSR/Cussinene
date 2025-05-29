import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

type InventoryContextType = {
  inventory: InventoryItem[];
  loading: boolean;
  fetchInventory: (userId: string | undefined) => Promise<void>;
  addInventoryItem: (userId: string, item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (item: InventoryItem) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}

type InventoryProviderProps = {
  children: ReactNode;
};

export function InventoryProvider({ children }: InventoryProviderProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInventory = useCallback(async (userId: string | undefined) => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await client.models.Inventory.list({
        filter: { userId: { eq: userId } }
      });
      setInventory(data ?? []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addInventoryItem = useCallback(async (userId: string, item: Omit<InventoryItem, 'id'>) => {
    try {
      await client.models.Inventory.create({
        userId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit as Schema['Inventory']['type']['unit'],
      });
      await fetchInventory(userId);
    } catch (error) {
      console.error('Error adding inventory item:', error);
    }
  }, [fetchInventory]);

  const updateInventoryItem = useCallback(async (item: InventoryItem) => {
    try {
      await client.models.Inventory.update({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit as Schema['Inventory']['type']['unit'],
      });
      setInventory(prev => 
        prev.map(i => i.id === item.id ? item : i)
      );
    } catch (error) {
      console.error('Error updating inventory item:', error);
    }
  }, []);

  const deleteInventoryItem = useCallback(async (id: string) => {
    try {
      await client.models.Inventory.delete({ id });
      setInventory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    }
  }, []);

  const value = {
    inventory,
    loading,
    fetchInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
} 