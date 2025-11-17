import { useState } from 'react';
import { db } from '@/db/dexie';
import {
  parseCSV,
  parseExcel,
  detectCSVType,
  validateIncomeExpenseRow,
  type ParsedCSVData,
} from '@/services/csvParser';
import { Income, Expense } from '@/types/models';

interface ImportPreview {
  type: 'income-expense' | 'asset-liability' | 'unknown';
  data: ParsedCSVData;
  validRows: Array<{ index: number; data: any; errors: string[] }>;
  invalidRows: Array<{ index: number; data: any; errors: string[] }>;
  fileFormat: string;
}

/**
 * Get a friendly label for the detected file format
 */
function getFormatLabel(format: string): string {
  const formatMap: Record<string, string> = {
    'simple': 'Simple Format',
    'financial-statement': 'Financial Statement',
    'bank-statement': 'Bank Statement',
    'unknown': 'Unknown Format',
  };
  return formatMap[format] || 'Unknown Format';
}

export default function ImportCenter(): JSX.Element {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [importResult, setImportResult] = useState<{ incomeCount: number; expenseCount: number } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      let parsed: ParsedCSVData;
      const fileName = file.name.toLowerCase();

      // Determine file type and parse accordingly
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        parsed = await parseExcel(file);
      } else if (fileName.endsWith('.csv')) {
        const text = await file.text();
        parsed = parseCSV(text);
      } else {
        throw new Error('Unsupported file format. Please use .csv or .xlsx files.');
      }

      const csvType = detectCSVType(parsed.headers);

      // Even if type is 'unknown', we can still try to import with flexible detection
      // Only fail if truly unparseable
      if (csvType === 'unknown' && parsed.format === 'unknown') {
        setMessage({
          type: 'error',
          text: 'Unable to detect file format. Please ensure your file has columns like: Date, Description, Amount, or Type, Name, Amount, Frequency'
        });
        setIsProcessing(false);
        return;
      }

      // Validate rows
      const validRows: Array<{ index: number; data: any; errors: string[] }> = [];
      const invalidRows: Array<{ index: number; data: any; errors: string[] }> = [];

      if (csvType === 'income-expense') {
        parsed.rows.forEach((row, index) => {
          const validation = validateIncomeExpenseRow(row);
          if (validation.valid) {
            validRows.push({ index, data: row, errors: [] });
          } else {
            invalidRows.push({ index, data: row, errors: validation.errors });
          }
        });
      }

      const formatLabel = getFormatLabel(parsed.format);
      const confidenceText = parsed.columnMappingConfidence
        ? ` (${parsed.columnMappingConfidence}% confidence)`
        : '';
      setPreview({ type: csvType, data: parsed, validRows, invalidRows, fileFormat: formatLabel });
      setSelectedRows(new Set(validRows.map((r) => r.index)));

      const messageText = validRows.length === parsed.rows.length
        ? `✅ ${formatLabel}${confidenceText} | All ${validRows.length} rows are valid!`
        : `⚠️ ${formatLabel}${confidenceText} | Found ${validRows.length} valid rows and ${invalidRows.length} invalid rows`;

      setMessage({
        type: validRows.length === parsed.rows.length ? 'success' : 'info',
        text: messageText,
      });
    } catch (error) {
      console.error('Parse error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to parse CSV file',
      });
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const handleImport = async (): Promise<void> => {
    if (!preview) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      let incomeCount = 0;
      let expenseCount = 0;
      const failedRows: string[] = [];

      if (preview.type === 'income-expense') {
        for (const row of preview.validRows) {
          if (!selectedRows.has(row.index)) continue;

          const data = row.data;
          let transactionType = data['Type']?.toLowerCase() || 'expense';
          const now = new Date().toISOString();

          try {
            // Parse amount - handle various formats (including negative amounts)
            const amountStr = data['Amount']?.toString().replace(/[$,]/g, '') || '0';
            let amount = parseFloat(amountStr);

            if (isNaN(amount)) {
              failedRows.push(`Row ${row.index + 1}: Invalid amount "${data['Amount']}"`);
              continue;
            }

            // Handle negative amounts - they flip the transaction type
            // -$100 expense becomes $100 income, and vice versa
            if (amount < 0) {
              amount = Math.abs(amount);
              // Flip the type for negative amounts
              transactionType = transactionType === 'income' ? 'expense' : 'income';
            }

            // Skip if amount is 0 after processing
            if (amount === 0) {
              continue;
            }

            // Check category and name for income indicators
            // This overrides the Type field if strong keywords are found
            const nameCategory = `${data['Name'] || ''} ${data['Category'] || ''}`.toLowerCase();
            const incomeKeywords = [
              'income', 'paycheck', 'salary', 'wage', 'bonus', 'dividend',
              'interest', 'refund', 'reimbursement', 'revenue', 'commission',
              'royalty', 'gift', 'grant', 'payment in', 'deposit'
            ];
            const expenseKeywords = [
              'expense', 'cost', 'fee', 'rent', 'utility', 'gas', 'electricity',
              'water', 'phone', 'internet', 'insurance', 'mortgage', 'loan',
              'payment out', 'withdrawal'
            ];

            // Check for strong income indicators
            if (incomeKeywords.some(keyword => nameCategory.includes(keyword))) {
              transactionType = 'income';
            }
            // Check for strong expense indicators (only if not already marked as income)
            else if (expenseKeywords.some(keyword => nameCategory.includes(keyword))) {
              transactionType = 'expense';
            }

            // Normalize frequency
            const frequencyStr = data['Frequency']?.toLowerCase().trim() || 'one-time';
            const validFrequencies = [
              'daily', 'weekly', 'bi-weekly', 'semi-monthly',
              'monthly', 'quarterly', 'annually', 'one-time'
            ];
            const frequency = validFrequencies.includes(frequencyStr)
              ? (frequencyStr as any)
              : 'one-time';

            const isIncome = transactionType === 'income';

            if (isIncome) {
              const incomeRecord: Income = {
                id: crypto.randomUUID(),
                name: data['Name'] || 'Imported Income',
                amount,
                frequency: frequency as Exclude<any, 'daily'>,
                category: data['Category'] || 'Other',
                startDate: data['Start Date'] || new Date().toISOString().split('T')[0],
                endDate: data['End Date'] || undefined,
                isActive: data['Status']?.toLowerCase() !== 'inactive',
                notes: data['Notes'] || undefined,
                createdAt: now,
                updatedAt: now,
              };

              await db.incomes.add(incomeRecord);
              incomeCount++;
            } else {
              const expenseRecord: Expense = {
                id: crypto.randomUUID(),
                name: data['Name'] || 'Imported Expense',
                amount,
                frequency: frequency as any,
                category: data['Category'] || 'Other',
                dueDate: data['Due Date'] || undefined,
                isActive: data['Status']?.toLowerCase() !== 'inactive',
                notes: data['Notes'] || undefined,
                createdAt: now,
                updatedAt: now,
              };

              await db.expenses.add(expenseRecord);
              expenseCount++;
            }
          } catch (error) {
            console.error(`Failed to import row ${row.index}:`, error);
            failedRows.push(
              `Row ${row.index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }

      const totalImported = incomeCount + expenseCount;
      if (totalImported === 0) {
        setMessage({
          type: 'error',
          text: `No records were imported. ${failedRows.length > 0 ? 'Errors: ' + failedRows.join('; ') : ''}`
        });
      } else {
        setImportResult({ incomeCount, expenseCount });
        let successMsg = `✅ Successfully imported ${totalImported} records! (${incomeCount} income, ${expenseCount} expense)`;
        if (failedRows.length > 0) {
          successMsg += `\n⚠️ Failed to import ${failedRows.length} rows`;
        }
        setMessage({ type: 'success', text: successMsg });
        setPreview(null);
        setSelectedRows(new Set());
      }
    } catch (error) {
      console.error('Import error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to import data. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRowSelection = (index: number): void => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllSelection = (): void => {
    if (!preview) return;
    if (selectedRows.size === preview.validRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(preview.validRows.map((r) => r.index)));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Import Center</h1>

      {/* Message Display */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : message.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Import Success Results */}
      {importResult && (
        <div className="mb-6 bg-green-50 rounded-lg shadow border border-green-200 p-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">✅</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-900 mb-4">Import Successful!</h2>
              <p className="text-green-800 mb-6">
                {importResult.incomeCount + importResult.expenseCount} records imported and saved!
                <br/>
                <strong>{importResult.incomeCount} income</strong> and <strong>{importResult.expenseCount} expense</strong> items are now in your app.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {importResult.incomeCount > 0 && (
                  <a
                    href="/income"
                    className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-center transition"
                  >
                    📊 View {importResult.incomeCount} Income{importResult.incomeCount !== 1 ? 's' : ''}
                  </a>
                )}
                {importResult.expenseCount > 0 && (
                  <a
                    href="/expenses"
                    className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-center transition"
                  >
                    💸 View {importResult.expenseCount} Expense{importResult.expenseCount !== 1 ? 's' : ''}
                  </a>
                )}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                💡 Tip: Your Dashboard will now show the imported income and expenses in the monthly summaries!
              </div>
              <button
                onClick={() => {
                  setImportResult(null);
                  setMessage(null);
                }}
                className="mt-4 text-green-600 hover:text-green-900 font-medium"
              >
                ← Import Another File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      {!preview && !importResult && (
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition">
            <p className="text-gray-600 mb-4">
              <span className="text-2xl">📁</span>
            </p>
            <p className="text-lg font-semibold mb-2">Upload Financial Data</p>
            <p className="text-gray-600 text-sm mb-6">
              Drag and drop your CSV or Excel file here, or click to select. Supports simple format, financial statements, and Excel files.
            </p>
            <label className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer font-medium">
              Choose File
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">📋 Supported Formats:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>✅ <strong>Simple Format:</strong> Type, Name, Amount, Frequency, Category (exported from this app)</li>
                <li>✅ <strong>Financial Statement:</strong> Account names with monthly columns & totals (e.g., Rent, Jan 2025, Feb 2025, ..., Total)</li>
                <li>✅ <strong>Bank Statements:</strong> Date, Description, Debit/Credit columns (from your bank)</li>
                <li>✅ <strong>Flexible Detection:</strong> App intelligently detects and maps various column formats</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-semibold text-amber-900 mb-2">💡 Smart Column Mapping:</p>
              <p className="text-xs text-amber-800 mb-2">
                The app now automatically detects and maps column names. Even if your columns aren't named exactly as expected, our smart detection will try to match them. For example:
              </p>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                <li>"Transaction Date" or "Date Posted" → recognized as Date</li>
                <li>"Memo" or "Notes" → recognized as Description</li>
                <li>"Income Type" or "Category" → recognized as Type</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {preview && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Summary Stats */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b">
            <div className="mb-4 pb-4 border-b border-indigo-200">
              <p className="text-sm font-semibold text-indigo-900">
                📋 Detected Format: <span className="text-indigo-700">{preview.fileFormat}</span>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Total Rows</p>
                <p className="text-2xl font-bold">{preview.data.rows.length}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Valid Rows</p>
                <p className="text-2xl font-bold text-green-600">{preview.validRows.length}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Invalid Rows</p>
                <p className="text-2xl font-bold text-red-600">{preview.invalidRows.length}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-b bg-gray-50 flex gap-4">
            <button
              onClick={() => setPreview(null)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
            >
              Choose Different File
            </button>
            {preview.validRows.length > 0 && (
              <>
                <button
                  onClick={toggleAllSelection}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
                >
                  {selectedRows.size === preview.validRows.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleImport}
                  disabled={selectedRows.size === 0 || isProcessing}
                  className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {isProcessing ? 'Importing...' : `Import (${selectedRows.size} selected)`}
                </button>
              </>
            )}
          </div>

          {/* Valid Rows Preview */}
          {preview.validRows.length > 0 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Valid Records</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-8">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === preview.validRows.length && preview.validRows.length > 0}
                          onChange={toggleAllSelection}
                          className="rounded"
                        />
                      </th>
                      {preview.data.headers.map((header) => (
                        <th key={header} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.validRows.map((row) => (
                      <tr key={row.index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 w-8">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(row.index)}
                            onChange={() => toggleRowSelection(row.index)}
                            className="rounded"
                          />
                        </td>
                        {preview.data.headers.map((header) => (
                          <td key={header} className="px-4 py-3 text-sm text-gray-900">
                            {row.data[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invalid Rows Alert */}
          {preview.invalidRows.length > 0 && (
            <div className="p-6 border-t bg-red-50">
              <h3 className="text-lg font-semibold mb-4 text-red-800">⚠️ Invalid Records ({preview.invalidRows.length})</h3>
              <div className="space-y-4">
                {preview.invalidRows.map((row) => (
                  <div key={row.index} className="p-4 bg-white border border-red-200 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">Row {row.index + 2}:</p>
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {row.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-600 mt-2">
                      {preview.data.headers.map((h) => `${h}: ${row.data[h]}`).join(' | ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
