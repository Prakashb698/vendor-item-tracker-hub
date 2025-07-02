
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Transaction = Tables<'transactions'>;

export type TransactionType = 'stock_in' | 'stock_out' | 'adjustment' | 'sale' | 'purchase';

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      set({ transactions: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  createTransaction: async (transactionData) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (error) throw error;
      
      // Refresh transactions after creating
      get().fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
      set({ error: (error as Error).message });
    }
  },

  clearError: () => set({ error: null }),
}));
