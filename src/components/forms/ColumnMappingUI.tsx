/**
 * Column Mapping UI Component
 * Allows users to manually map columns when auto-detection is uncertain
 */
import React from 'react';
import { ColumnMapping, ColumnType, DetectedColumns } from '@/services/columnMapper';

interface ColumnMappingUIProps {
  detectedColumns: DetectedColumns;
  headers: string[];
  onMappingChange: (mapping: ColumnMapping) => void;
  onConfirm: () => void;
  isOpen: boolean;
}

const COLUMN_TYPE_LABELS: Record<ColumnType, string> = {
  'type': 'Transaction Type (Income/Expense)',
  'date': 'Date',
  'description': 'Description/Memo',
  'amount': 'Amount',
  'debit': 'Debit Amount',
  'credit': 'Credit Amount',
  'category': 'Category',
  'account': 'Account',
  'frequency': 'Frequency',
  'name': 'Name/Title',
  'balance': 'Balance',
  'total': 'Total',
  'ignore': 'Ignore This Column',
};

const COLUMN_TYPES: ColumnType[] = [
  'type', 'date', 'description', 'amount', 'debit', 'credit',
  'category', 'account', 'frequency', 'name', 'balance', 'total', 'ignore'
];

export default function ColumnMappingUI({
  detectedColumns,
  headers,
  onMappingChange,
  onConfirm,
  isOpen,
}: ColumnMappingUIProps): JSX.Element | null {
  if (!isOpen) return null;

  const handleColumnTypeChange = (columnIndex: number, newType: ColumnType) => {
    const newMapping = { ...detectedColumns.mapping };
    newMapping[columnIndex] = newType;
    onMappingChange(newMapping);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Map Your Columns</h2>
          <p className="text-gray-600 mb-6">
            The app detected your columns with {detectedColumns.confidence}% confidence.
            Please review and adjust the mappings if needed:
          </p>

          <div className="space-y-4">
            {headers.map((header, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-900 mb-3">Column {index + 1}: {header}</p>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detected As:
                  </label>
                  <select
                    value={detectedColumns.mapping[index] || 'ignore'}
                    onChange={(e) =>
                      handleColumnTypeChange(index, e.target.value as ColumnType)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {COLUMN_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {COLUMN_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show suggestions */}
                {detectedColumns.suggestions[index] && detectedColumns.suggestions[index].length > 1 && (
                  <div className="text-xs text-gray-600">
                    <p className="font-medium mb-1">Other possible matches:</p>
                    <div className="flex gap-2 flex-wrap">
                      {detectedColumns.suggestions[index]
                        .filter((s) => s !== detectedColumns.mapping[index])
                        .slice(0, 2)
                        .map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleColumnTypeChange(index, suggestion)}
                            className="px-2 py-1 bg-gray-100 hover:bg-indigo-100 rounded text-xs text-gray-700 hover:text-indigo-700 transition"
                          >
                            {COLUMN_TYPE_LABELS[suggestion]}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => {
                // Reset to detected mapping
                const resetMapping: ColumnMapping = {};
                Object.entries(detectedColumns.mapping).forEach(([key, val]) => {
                  resetMapping[parseInt(key, 10)] = val;
                });
                onMappingChange(resetMapping);
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Reset to Auto-Detected
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Confirm Mapping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
