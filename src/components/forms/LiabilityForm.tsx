import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LiabilityFormSchema, LiabilityFormData } from '@/services/validation';
import { Liability } from '@/types/models';

const LIABILITY_TYPES = [
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto-loan', label: 'Auto Loan' },
  { value: 'student-loan', label: 'Student Loan' },
  { value: 'personal-loan', label: 'Personal Loan' },
  { value: 'other', label: 'Other' },
];

// Keywords that suggest this should be an expense instead
const EXPENSE_KEYWORDS = [
  'rent',
  'groceries',
  'gas',
  'electricity',
  'water',
  'internet',
  'phone',
  'utility',
  'gym',
  'subscription',
  'insurance',
];

interface LiabilityFormProps {
  initialData?: Liability;
  onSubmit: (data: LiabilityFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function LiabilityForm({
  initialData,
  onSubmit,
  isLoading,
}: LiabilityFormProps): JSX.Element {
  const [liabilityName, setLiabilityName] = useState(initialData?.name || '');
  const [showExpenseWarning, setShowExpenseWarning] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LiabilityFormData>({
    resolver: zodResolver(LiabilityFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          type: initialData.type,
          currentBalance: initialData.currentBalance,
          interestRate: initialData.interestRate,
          monthlyPayment: initialData.monthlyPayment,
          notes: initialData.notes,
        }
      : undefined,
  });

  const handleNameChange = (value: string): void => {
    setLiabilityName(value);
    // Check if the liability name contains expense keywords
    const hasExpenseKeyword = EXPENSE_KEYWORDS.some((keyword) =>
      value.toLowerCase().includes(keyword)
    );
    setShowExpenseWarning(hasExpenseKeyword);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Help Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
        <p className="font-semibold text-purple-900 mb-2">💡 What goes here?</p>
        <p className="text-purple-800 mb-2">
          <strong>Liabilities</strong> are debts or money owed (mortgages, loans, credit cards).
        </p>
        <div className="text-purple-800 text-xs space-y-1">
          <p>✅ <strong>Examples:</strong> Home Mortgage, Car Loan, Student Loan, Credit Card Balance</p>
          <p>❌ <strong>NOT here:</strong> Rent, Utilities, Groceries (use Expenses tab instead)</p>
        </div>
      </div>

      {/* Expense Warning */}
      {showExpenseWarning && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm">
          <p className="font-semibold text-yellow-900 mb-1">⚠️ Did you mean to add an Expense?</p>
          <p className="text-yellow-800 text-xs mb-2">
            It looks like you're adding "{liabilityName}". This sounds like a recurring payment that should go in the <strong>Expenses</strong> tab instead.
          </p>
          <p className="text-yellow-800 text-xs">
            Liabilities are debts you owe (mortgages, loans). Recurring payments like rent and utilities belong in Expenses.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Liability Name
        </label>
        <input
          {...register('name')}
          type="text"
          onChange={(e) => {
            handleNameChange(e.target.value);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., Home Mortgage, Car Loan, Chase Credit Card"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Liability Type
          </label>
          <select
            {...register('type')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select type</option>
            {LIABILITY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        <div>
          <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700">
            Current Balance
          </label>
          <input
            {...register('currentBalance')}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="0.00"
          />
          {errors.currentBalance && (
            <p className="mt-1 text-sm text-red-600">{errors.currentBalance.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
            Interest Rate (%) - Optional
          </label>
          <input
            {...register('interestRate')}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="0.00"
          />
          {errors.interestRate && (
            <p className="mt-1 text-sm text-red-600">{errors.interestRate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="monthlyPayment" className="block text-sm font-medium text-gray-700">
            Monthly Payment - Optional
          </label>
          <input
            {...register('monthlyPayment')}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="0.00"
          />
          {errors.monthlyPayment && (
            <p className="mt-1 text-sm text-red-600">{errors.monthlyPayment.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes (Optional)
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          placeholder="Add any notes..."
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : initialData ? 'Update Liability' : 'Add Liability'}
      </button>
    </form>
  );
}
