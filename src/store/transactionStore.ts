import { create } from 'zustand';
import { Transaction } from '../types/transaction';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  setTransactions: (transactions: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  loading: true,
  error: null,
  currentPage: 1,
  totalPages: 1,
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setTotalPages: (totalPages) => set({ totalPages }),
}));