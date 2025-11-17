import { useState } from 'react';
import { db } from '@/db/dexie';
import { exportAsJSON, exportAsCSV, exportNetWorthAsCSV, downloadFile } from '@/services/export';

export default function Settings(): JSX.Element {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportJSON = async (): Promise<void> => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const jsonData = await exportAsJSON();
      const filename = `fintracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(jsonData, filename, 'application/json');
      setExportMessage({ type: 'success', text: 'All data exported successfully!' });
    } catch (error) {
      console.error('Export failed:', error);
      setExportMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportIncomeExpenseCSV = async (): Promise<void> => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const csvData = await exportAsCSV();
      const filename = `fintracker-income-expenses-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csvData, filename, 'text/csv');
      setExportMessage({ type: 'success', text: 'Income/Expense data exported successfully!' });
    } catch (error) {
      console.error('Export failed:', error);
      setExportMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportNetWorthCSV = async (): Promise<void> => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const csvData = await exportNetWorthAsCSV();
      const filename = `fintracker-assets-liabilities-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csvData, filename, 'text/csv');
      setExportMessage({ type: 'success', text: 'Net Worth data exported successfully!' });
    } catch (error) {
      console.error('Export failed:', error);
      setExportMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExporting(true);
    setExportMessage(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate that the JSON has the expected structure
      if (!data.incomes || !data.expenses || !data.assets || !data.liabilities) {
        throw new Error('Invalid backup file format');
      }

      // Confirm before importing
      if (!window.confirm('This will replace all your current data. Are you sure?')) {
        setIsExporting(false);
        return;
      }

      // Clear existing data
      await db.incomes.clear();
      await db.expenses.clear();
      await db.transactions.clear();
      await db.assets.clear();
      await db.liabilities.clear();

      // Import data (omit ID to let Dexie auto-generate)
      if (data.incomes.length > 0) {
        await db.incomes.bulkAdd(data.incomes.map((item: any) => ({ ...item, id: undefined })));
      }
      if (data.expenses.length > 0) {
        await db.expenses.bulkAdd(data.expenses.map((item: any) => ({ ...item, id: undefined })));
      }
      if (data.assets.length > 0) {
        await db.assets.bulkAdd(data.assets.map((item: any) => ({ ...item, id: undefined })));
      }
      if (data.liabilities.length > 0) {
        await db.liabilities.bulkAdd(data.liabilities.map((item: any) => ({ ...item, id: undefined })));
      }

      setExportMessage({ type: 'success', text: 'Data imported successfully!' });
    } catch (error) {
      console.error('Import failed:', error);
      setExportMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to import data. Please check the file format.',
      });
    } finally {
      setIsExporting(false);
      event.target.value = '';
    }
  };

  const handleClearAllData = async (): Promise<void> => {
    if (
      !window.confirm(
        'This will permanently delete ALL your data. This action cannot be undone. Are you absolutely sure?'
      )
    ) {
      return;
    }

    setIsExporting(true);
    setExportMessage(null);
    try {
      await db.incomes.clear();
      await db.expenses.clear();
      await db.transactions.clear();
      await db.assets.clear();
      await db.liabilities.clear();
      setExportMessage({ type: 'success', text: 'All data has been cleared.' });
    } catch (error) {
      console.error('Clear data failed:', error);
      setExportMessage({ type: 'error', text: 'Failed to clear data. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Message Display */}
      {exportMessage && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            exportMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {exportMessage.text}
        </div>
      )}

      {/* Data Export Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Data Export</h2>
        <p className="text-gray-600 text-sm mb-4">
          Download your financial data in various formats. You can use JSON backups to restore your data later.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-left"
          >
            {isExporting ? 'Exporting...' : '📥 Export All Data (JSON Backup)'}
          </button>
          <p className="text-xs text-gray-500 ml-4">Complete backup of all incomes, expenses, assets, and liabilities</p>

          <button
            onClick={handleExportIncomeExpenseCSV}
            disabled={isExporting}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-left"
          >
            {isExporting ? 'Exporting...' : '📊 Export Income & Expenses (CSV)'}
          </button>
          <p className="text-xs text-gray-500 ml-4">Spreadsheet-compatible format for analysis in Excel or Google Sheets</p>

          <button
            onClick={handleExportNetWorthCSV}
            disabled={isExporting}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-left"
          >
            {isExporting ? 'Exporting...' : '💰 Export Assets & Liabilities (CSV)'}
          </button>
          <p className="text-xs text-gray-500 ml-4">Net worth details including interest rates and payment schedules</p>
        </div>
      </div>

      {/* Data Import Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Data Import</h2>
        <p className="text-gray-600 text-sm mb-4">Restore your data from a previously exported JSON backup file.</p>

        <label className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium cursor-pointer inline-block text-center">
          {isExporting ? 'Importing...' : '📤 Import JSON Backup'}
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            disabled={isExporting}
            className="hidden"
            aria-label="Import JSON backup file"
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">Select a JSON file exported from this application</p>
      </div>

      {/* Data Management Section */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
        <p className="text-gray-600 text-sm mb-4">Permanently delete all your financial data. This action cannot be undone.</p>

        <button
          onClick={handleClearAllData}
          disabled={isExporting}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isExporting ? 'Clearing...' : '🗑️ Delete All Data'}
        </button>
      </div>
    </div>
  );
}
