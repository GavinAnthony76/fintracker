import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useIncome } from '@/hooks/useIncome';
import { useExpense } from '@/hooks/useExpense';
import { useTransaction } from '@/hooks/useTransaction';
import { formatCurrency, calculateCashFlow, monthlyEquivalent } from '@/utils/finance';

export default function Dashboard(): JSX.Element {
  const { incomes } = useIncome();
  const { expenses } = useExpense();
  const { transactions } = useTransaction();

  const stats = useMemo(() => {
    const monthlyIncome = incomes
      .filter((i) => i.isActive)
      .reduce((sum, i) => sum + monthlyEquivalent(i.amount, i.frequency), 0);

    const monthlyExpense = expenses
      .filter((e) => e.isActive)
      .reduce((sum, e) => sum + monthlyEquivalent(e.amount, e.frequency), 0);

    const cashFlow = monthlyIncome - monthlyExpense;

    return {
      monthlyIncome,
      monthlyExpense,
      cashFlow,
    };
  }, [incomes, expenses]);

  const chartData = useMemo(() => {
    const categories = new Set<string>();
    incomes.forEach((i) => categories.add(i.category));
    expenses.forEach((e) => categories.add(e.category));

    return Array.from(categories).map((category) => {
      const incomeAmount = incomes
        .filter((i) => i.category === category && i.isActive)
        .reduce((sum, i) => sum + monthlyEquivalent(i.amount, i.frequency), 0);

      const expenseAmount = expenses
        .filter((e) => e.category === category && e.isActive)
        .reduce((sum, e) => sum + monthlyEquivalent(e.amount, e.frequency), 0);

      return {
        category,
        income: incomeAmount,
        expense: expenseAmount,
      };
    });
  }, [incomes, expenses]);

  // Monthly breakdown from imported transactions
  const monthlyBreakdown = useMemo(() => {
    const monthMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((tx) => {
      // Extract year-month from date (YYYY-MM-DD format)
      const monthKey = tx.date.substring(0, 7); // "2025-01", "2025-02", etc.

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { income: 0, expense: 0 });
      }

      const month = monthMap.get(monthKey)!;
      if (tx.type === 'income') {
        month.income += tx.amount;
      } else {
        month.expense += tx.amount;
      }
    });

    // Convert to array and sort by month
    return Array.from(monthMap.entries())
      .map(([month, { income, expense }]) => ({
        month,
        income,
        expense,
        cashFlow: income - expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Financial Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Monthly Income</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.monthlyIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Monthly Expenses</p>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.monthlyExpense)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Cash Flow</p>
          <p
            className={`text-3xl font-bold ${
              stats.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(stats.cashFlow)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Assets</p>
          <p className="text-3xl font-bold text-blue-600">Coming Soon</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Income vs Expenses by Category</h2>
          {chartData.length === 0 ? (
            <p className="text-gray-500">Add income and expenses to see the chart</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" />
                <Bar dataKey="expense" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-gray-600">Active Income Sources</span>
              <span className="font-semibold">{incomes.filter((i) => i.isActive).length}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-gray-600">Active Expenses</span>
              <span className="font-semibold">{expenses.filter((e) => e.isActive).length}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-gray-600">Savings Rate</span>
              <span className="font-semibold">
                {stats.monthlyIncome > 0
                  ? `${((stats.cashFlow / stats.monthlyIncome) * 100).toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Expense Ratio</span>
              <span className="font-semibold">
                {stats.monthlyIncome > 0
                  ? `${((stats.monthlyExpense / stats.monthlyIncome) * 100).toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown from Imported Transactions */}
      {monthlyBreakdown.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Monthly Breakdown (From Imported Data)</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            {monthlyBreakdown.length === 0 ? (
              <p className="text-gray-500">No transaction data available. Import a bank statement or financial statement to see monthly breakdown.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      label={{ value: 'Month (YYYY-MM)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Income"
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Expenses"
                    />
                    <Line
                      type="monotone"
                      dataKey="cashFlow"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Cash Flow"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Monthly Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Income</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cash Flow</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {monthlyBreakdown.map((month) => (
                          <tr key={month.month} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{month.month}</td>
                            <td className="px-6 py-4 text-sm text-green-600 font-semibold">{formatCurrency(month.income)}</td>
                            <td className="px-6 py-4 text-sm text-red-600 font-semibold">{formatCurrency(month.expense)}</td>
                            <td className={`px-6 py-4 text-sm font-semibold ${month.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(month.cashFlow)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
