import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AssetForm from '@/components/forms/AssetForm';
import LiabilityForm from '@/components/forms/LiabilityForm';
import { useAsset } from '@/hooks/useAsset';
import { useLiability } from '@/hooks/useLiability';
import type { AssetFormData, LiabilityFormData } from '@/services/validation';
import { formatCurrency, calculateNetWorth } from '@/utils/finance';

type Tab = 'assets' | 'liabilities';

export default function NetWorth(): JSX.Element {
  const { assets, addAsset, updateAsset, deleteAsset } = useAsset();
  const { liabilities, addLiability, updateLiability, deleteLiability } = useLiability();

  const [activeTab, setActiveTab] = useState<Tab>('assets');
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingLiabilityId, setEditingLiabilityId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const netWorth = useMemo(() => calculateNetWorth(assets, liabilities), [assets, liabilities]);

  const totalAssets = useMemo(() => {
    return assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  }, [assets]);

  const totalLiabilities = useMemo(() => {
    return liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0);
  }, [liabilities]);

  // Generate historical net worth data (monthly snapshots)
  const historicalData = useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push({ month: monthStr, netWorth });
    }
    return months;
  }, [netWorth]);

  const editingAsset = assets.find((a) => a.id === editingAssetId);
  const editingLiability = liabilities.find((l) => l.id === editingLiabilityId);

  const handleAddAsset = async (data: AssetFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      await addAsset({
        ...data,
        notes: data.notes || undefined,
      });
      setEditingAssetId(null);
    } catch (error) {
      console.error('Failed to add asset:', error);
      alert('Failed to add asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAsset = async (data: AssetFormData): Promise<void> => {
    if (!editingAssetId) return;
    setIsSubmitting(true);
    try {
      await updateAsset(editingAssetId, {
        ...data,
        notes: data.notes || undefined,
      });
      setEditingAssetId(null);
    } catch (error) {
      console.error('Failed to update asset:', error);
      alert('Failed to update asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLiability = async (data: LiabilityFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      await addLiability({
        ...data,
        interestRate: data.interestRate || undefined,
        monthlyPayment: data.monthlyPayment || undefined,
        notes: data.notes || undefined,
      });
      setEditingLiabilityId(null);
    } catch (error) {
      console.error('Failed to add liability:', error);
      alert('Failed to add liability');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLiability = async (data: LiabilityFormData): Promise<void> => {
    if (!editingLiabilityId) return;
    setIsSubmitting(true);
    try {
      await updateLiability(editingLiabilityId, {
        ...data,
        interestRate: data.interestRate || undefined,
        monthlyPayment: data.monthlyPayment || undefined,
        notes: data.notes || undefined,
      });
      setEditingLiabilityId(null);
    } catch (error) {
      console.error('Failed to update liability:', error);
      alert('Failed to update liability');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteAsset(id);
    } catch (error) {
      console.error('Failed to delete asset:', error);
      alert('Failed to delete asset');
    }
  };

  const handleDeleteLiability = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteLiability(id);
    } catch (error) {
      console.error('Failed to delete liability:', error);
      alert('Failed to delete liability');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Net Worth Tracking</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Assets</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Liabilities</p>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Net Worth</p>
          <p className={`text-3xl font-bold ${netWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(netWorth)}
          </p>
        </div>
      </div>

      {/* Historical Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Net Worth Trend (Last 12 Months)</h2>
        {historicalData.length === 0 ? (
          <p className="text-gray-500">Add assets or liabilities to see chart</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#2563eb"
                dot={{ fill: '#2563eb' }}
                name="Net Worth"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 px-4 py-3 font-medium text-center ${
              activeTab === 'assets'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Assets ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('liabilities')}
            className={`flex-1 px-4 py-3 font-medium text-center ${
              activeTab === 'liabilities'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Liabilities ({liabilities.length})
          </button>
        </div>

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <div className="grid grid-cols-3 gap-6 p-6">
            <div className="col-span-1">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                </h3>
                <AssetForm
                  initialData={editingAsset}
                  onSubmit={editingAsset ? handleUpdateAsset : handleAddAsset}
                  isLoading={isSubmitting}
                />
                {editingAssetId && (
                  <button
                    onClick={() => setEditingAssetId(null)}
                    className="w-full mt-4 text-gray-600 hover:text-gray-900 py-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="col-span-2">
              {assets.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No assets yet</div>
              ) : (
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-sm text-gray-600">
                          {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} • {asset.valuationDate}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-green-600 mr-4">
                        {formatCurrency(asset.currentValue)}
                      </p>
                      <div className="space-x-2">
                        <button
                          onClick={() => setEditingAssetId(asset.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Liabilities Tab */}
        {activeTab === 'liabilities' && (
          <div className="grid grid-cols-3 gap-6 p-6">
            <div className="col-span-1">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingLiability ? 'Edit Liability' : 'Add New Liability'}
                </h3>
                <LiabilityForm
                  initialData={editingLiability}
                  onSubmit={editingLiability ? handleUpdateLiability : handleAddLiability}
                  isLoading={isSubmitting}
                />
                {editingLiabilityId && (
                  <button
                    onClick={() => setEditingLiabilityId(null)}
                    className="w-full mt-4 text-gray-600 hover:text-gray-900 py-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="col-span-2">
              {liabilities.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No liabilities yet</div>
              ) : (
                <div className="space-y-3">
                  {liabilities.map((liability) => (
                    <div key={liability.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{liability.name}</p>
                        <p className="text-sm text-gray-600">
                          {liability.type.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          {liability.interestRate && ` • ${liability.interestRate}% APR`}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-red-600 mr-4">
                        {formatCurrency(liability.currentBalance)}
                      </p>
                      <div className="space-x-2">
                        <button
                          onClick={() => setEditingLiabilityId(liability.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLiability(liability.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
