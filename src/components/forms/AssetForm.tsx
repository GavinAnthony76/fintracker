import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AssetFormSchema, AssetFormData } from '@/services/validation';
import { Asset } from '@/types/models';

const ASSET_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'investment', label: 'Investment' },
  { value: 'property', label: 'Property' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' },
];

interface AssetFormProps {
  initialData?: Asset;
  onSubmit: (data: AssetFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function AssetForm({
  initialData,
  onSubmit,
  isLoading,
}: AssetFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(AssetFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          type: initialData.type,
          currentValue: initialData.currentValue,
          valuationDate: initialData.valuationDate,
          notes: initialData.notes,
        }
      : {
          valuationDate: new Date().toISOString().split('T')[0],
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p className="font-semibold text-blue-900 mb-2">💡 What goes here?</p>
        <p className="text-blue-800 mb-2">
          <strong>Assets</strong> are things of value that you own (house, car, savings, investments).
        </p>
        <div className="text-blue-800 text-xs space-y-1">
          <p>✅ <strong>Examples:</strong> House, Car, Savings Account, Investment Portfolio, Jewelry, Retirement Account</p>
          <p>❌ <strong>NOT here:</strong> Debts or loans you owe (use Liabilities tab instead)</p>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Asset Name
        </label>
        <input
          {...register('name')}
          type="text"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., Primary Home, Honda Civic, Emergency Fund, Brokerage Account"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Asset Type
          </label>
          <select
            {...register('type')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select type</option>
            {ASSET_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        <div>
          <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700">
            Current Value
          </label>
          <input
            {...register('currentValue')}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="0.00"
          />
          {errors.currentValue && (
            <p className="mt-1 text-sm text-red-600">{errors.currentValue.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="valuationDate" className="block text-sm font-medium text-gray-700">
          Valuation Date
        </label>
        <input
          {...register('valuationDate')}
          type="date"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        />
        {errors.valuationDate && (
          <p className="mt-1 text-sm text-red-600">{errors.valuationDate.message}</p>
        )}
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
        {isLoading ? 'Saving...' : initialData ? 'Update Asset' : 'Add Asset'}
      </button>
    </form>
  );
}
