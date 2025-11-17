export type Frequency =
  | 'daily'
  | 'weekly'
  | 'bi-weekly'
  | 'semi-monthly'
  | 'monthly'
  | 'quarterly'
  | 'annually'
  | 'one-time';

export interface Income {
  id: string;
  name: string;
  amount: number;
  frequency: Exclude<Frequency, 'daily'>;
  category: string;
  startDate: string; // ISO
  endDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  category: string;
  dueDate?: string; // ISO
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TxType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO
  description: string;
  amount: number;
  type: TxType;
  category: string;
  account?: string;
  source: 'manual' | 'import';
  importBatchId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Enhancements
  confidenceScore?: number;
  recurring?: boolean;
  linkedAssetId?: string;
  dateConfidence?: number; // 0-100, how certain we are about the date
}

export type AssetType = 'cash' | 'investment' | 'property' | 'vehicle' | 'other';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  currentValue: number;
  valuationDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type LiabilityType =
  | 'credit-card'
  | 'mortgage'
  | 'auto-loan'
  | 'student-loan'
  | 'personal-loan'
  | 'other';

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  currentBalance: number;
  interestRate?: number;
  monthlyPayment?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AccountType = 'checking' | 'savings' | 'credit' | 'retirement' | 'property';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution?: string;
  balance: number;
  lastUpdated: string;
  isLinked: boolean; // always false for MVP
}

export interface ImportTemplate {
  id: string;
  name: string;
  fileType: 'csv' | 'excel';
  columnMapping: {
    date: string | number;
    description: string | number;
    amount: string | number;
    category?: string | number;
    account?: string | number;
    creditCol?: string | number; // optional separate debit/credit
    debitCol?: string | number;
  };
  categoryRules?: Array<{ keyword: string; category: string }>;
  createdAt: string;
}
