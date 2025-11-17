import { useState } from 'react';
import ExpenseForm from '@/components/forms/ExpenseForm';
import { useExpense } from '@/hooks/useExpense';
import type { ExpenseFormData } from '@/services/validation';
import { formatCurrency } from '@/utils/finance';

export default function Expenses(): JSX.Element {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpense();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddExpense = async (data: ExpenseFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      await addExpense({
        ...data,
        dueDate: data.dueDate || undefined,
        notes: data.notes || undefined,
      });
      setIsAddingNew(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert('Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateExpense = async (data: ExpenseFormData): Promise<void> => {
    if (!editingId) return;
    setIsSubmitting(true);
    try {
      await updateExpense(editingId, {
        ...data,
        dueDate: data.dueDate || undefined,
        notes: data.notes || undefined,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update expense:', error);
      alert('Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense');
    }
  };

  const editingExpense = expenses.find((e) => e.id === editingId);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Expense Management</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <ExpenseForm
              initialData={editingExpense}
              onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
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
              <h2 className="text-xl font-semibold">Expenses</h2>
              {!isAddingNew && !editingId && (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  + Add Expense
                </button>
              )}
            </div>

            {expenses.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No expenses yet. Add one to get started!</p>
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
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {expense.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {expense.frequency.charAt(0).toUpperCase() + expense.frequency.slice(1)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{expense.category}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              expense.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {expense.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => setEditingId(expense.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
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
