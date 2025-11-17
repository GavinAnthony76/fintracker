import { z } from 'zod';
import type { Frequency } from '@/types/models';

const FREQUENCIES: Frequency[] = [
  'daily',
  'weekly',
  'bi-weekly',
  'semi-monthly',
  'monthly',
  'quarterly',
  'annually',
  'one-time',
];

const INCOME_FREQUENCIES = FREQUENCIES.filter((f) => f !== 'daily');

export const IncomeFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  amount: z.coerce.number().positive('Amount must be positive'),
  frequency: z.enum(INCOME_FREQUENCIES as [Frequency, ...Frequency[]]),
  category: z.string().min(1, 'Category is required').max(50),
  startDate: z.string().date(),
  endDate: z.string().date().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});

export type IncomeFormData = z.infer<typeof IncomeFormSchema>;

export const ExpenseFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  amount: z.coerce.number().positive('Amount must be positive'),
  frequency: z.enum(FREQUENCIES as [Frequency, ...Frequency[]]),
  category: z.string().min(1, 'Category is required').max(50),
  dueDate: z.string().date().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});

export type ExpenseFormData = z.infer<typeof ExpenseFormSchema>;

export const TransactionFormSchema = z.object({
  date: z.string().date(),
  description: z.string().min(1, 'Description is required').max(200),
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required').max(50),
  account: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type TransactionFormData = z.infer<typeof TransactionFormSchema>;

const ASSET_TYPES = ['cash', 'investment', 'property', 'vehicle', 'other'] as const;
const LIABILITY_TYPES = [
  'credit-card',
  'mortgage',
  'auto-loan',
  'student-loan',
  'personal-loan',
  'other',
] as const;

export const AssetFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(ASSET_TYPES),
  currentValue: z.coerce.number().nonnegative('Value must be non-negative'),
  valuationDate: z.string().date(),
  notes: z.string().max(500).optional(),
});

export type AssetFormData = z.infer<typeof AssetFormSchema>;

export const LiabilityFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(LIABILITY_TYPES),
  currentBalance: z.coerce.number().nonnegative('Balance must be non-negative'),
  interestRate: z.coerce.number().nonnegative().optional(),
  monthlyPayment: z.coerce.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
});

export type LiabilityFormData = z.infer<typeof LiabilityFormSchema>;
