import { useState } from 'react';
import IncomeForm from '@/components/forms/IncomeForm';
import { useIncome } from '@/hooks/useIncome';
import type { IncomeFormData } from '@/services/validation';
import { formatCurrency } from '@/utils/finance';

export default function Income(): JSX.Element {
  const { incomes, addIncome, updateIncome, deleteIncome } = useIncome();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddIncome = async (data: IncomeFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      await addIncome({
        ...data,
        endDate: data.endDate || undefined,
        notes: data.notes || undefined,
      });
      setIsAddingNew(false);
    } catch (error) {
      console.error('Failed to add income:', error);
      alert('Failed to add income');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIncome = async (data: IncomeFormData): Promise<void> => {
    if (!editingId) return;
    setIsSubmitting(true);
    try {
      await updateIncome(editingId, {
        ...data,
        endDate: data.endDate || undefined,
        notes: data.notes || undefined,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update income:', error);
      alert('Failed to update income');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIncome = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this income?')) return;
    try {
      await deleteIncome(id);
    } catch (error) {
      console.error('Failed to delete income:', error);
      alert('Failed to delete income');
    }
  };

  const editingIncome = incomes.find((i) => i.id === editingId);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Income Management</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingIncome ? 'Edit Income' : 'Add New Income'}
            </h2>
            <IncomeForm
              initialData={editingIncome}
              onSubmit={editingIncome ? handleUpdateIncome : handleAddIncome}
              isLoading={isSubmitting}
            />
            {(isAddingNew || editingId) && (
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingId(null);
                }}
                className="w-full mt-4 text-gray-600 hover:text-gray-900 py-2"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* List Column */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Income Sources</h2>
              {!isAddingNew && !editingId && (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  + Add Income
                </button>
              )}
            </div>

            {incomes.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No income sources yet. Add one to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {incomes.map((income) => (
                      <tr key={income.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {income.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(income.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {income.frequency.charAt(0).toUpperCase() + income.frequency.slice(1)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{income.category}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              income.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {income.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => setEditingId(income.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteIncome(income.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
