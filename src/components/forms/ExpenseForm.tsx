import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExpenseFormSchema, ExpenseFormData } from '@/services/validation';
import { Expense, Frequency } from '@/types/models';

const EXPENSE_FREQUENCIES: Frequency[] = [
  'daily',
  'weekly',
  'bi-weekly',
  'semi-monthly',
  'monthly',
  'quarterly',
  'annually',
  'one-time',
];

const EXPENSE_CATEGORIES = [
  'Housing',
  'Food',
  'Transportation',
  'Utilities',
  'Insurance',
  'Healthcare',
  'Entertainment',
  'Education',
  'Personal Care',
  'Debt Payment',
  'Other',
];

// Keywords that suggest this should be a liability instead
const LIABILITY_KEYWORDS = [
  'mortgage',
  'loan',
  'credit card',
  'student loan',
  'car loan',
  'auto loan',
  'vehicle loan',
  'personal loan',
  'debt',
];

interface ExpenseFormProps {
  initialData?: Expense;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function ExpenseForm({
  initialData,
  onSubmit,
  isLoading,
}: ExpenseFormProps): JSX.Element {
  const [expenseName, setExpenseName] = useState(initialData?.name || '');
  const [showLiabilityWarning, setShowLiabilityWarning] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(ExpenseFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          amount: initialData.amount,
          frequency: initialData.frequency,
          category: initialData.category,
          dueDate: initialData.dueDate || '',
          isActive: initialData.isActive,
          notes: initialData.notes,
        }
      : {
          isActive: true,
        },
  });

  const handleNameChange = (value: string): void => {
    setExpenseName(value);
    // Check if the expense name contains liability keywords
    const hasLiabilityKeyword = LIABILITY_KEYWORDS.some((keyword) =>
      value.toLowerCase().includes(keyword)
    );
    setShowLiabilityWarning(hasLiabilityKeyword);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p className="font-semibold text-blue-900 mb-2">💡 What goes here?</p>
        <p className="text-blue-800 mb-2">
          <strong>Expenses</strong> are recurring or one-time cash outflows (money you spend).
        </p>
        <div className="text-blue-800 text-xs space-y-1">
          <p>✅ <strong>Examples:</strong> Rent, Groceries, Utilities, Gas, Insurance premiums, Gym membership</p>
          <p>❌ <strong>NOT here:</strong> Mortgages, Loans, Credit card debt (use Liabilities tab instead)</p>
        </div>
      </div>

      {/* Liability Warning */}
      {showLiabilityWarning && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm">
          <p className="font-semibold text-yellow-900 mb-1">⚠️ Did you mean to add a Liability?</p>
          <p className="text-yellow-800 text-xs mb-2">
            It looks like you're adding a "{expenseName}". This might be a debt or loan that should go in the <strong>Net Worth</strong> tab under <strong>Liabilities</strong> instead.
          </p>
          <p className="text-yellow-800 text-xs">
            Mortgages, car loans, credit cards, and other debts belong in Liabilities. Expenses are payments like rent, utilities, and groceries.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Expense Name
        </label>
        <input
          {...register('name')}
          type="text"
          onChange={(e) => {
            handleNameChange(e.target.value);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., Rent, Groceries, Gas, Electricity Bill"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            {...register('amount')}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="0.00"
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
            Frequency
          </label>
          <select
            {...register('frequency')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select frequency</option>
            {EXPENSE_FREQUENCIES.map((freq) => (
              <option key={freq} value={freq}>
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </option>
            ))}
          </select>
          {errors.frequency && (
            <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          {...register('category')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select category</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date (Optional)
        </label>
        <input
          {...register('dueDate')}
          type="date"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        />
        {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>}
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

      <div className="flex items-center">
        <input
          {...register('isActive')}
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          defaultChecked
        />
        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
          Active
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : initialData ? 'Update Expense' : 'Add Expense'}
      </button>
    </form>
  );
}
