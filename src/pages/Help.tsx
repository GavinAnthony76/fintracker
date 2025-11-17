export default function Help(): JSX.Element {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">How Financial Tracker Works</h1>

      {/* Main Concept */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-indigo-900 mb-3">📊 The Core Concept</h2>
        <p className="text-indigo-800 mb-3">
          Financial Tracker uses two complementary views to manage your money:
        </p>
        <ul className="text-indigo-800 space-y-2">
          <li>
            <strong>Cash Flow View (Income & Expenses):</strong> Tracks money coming in and going out each
            month to see if you're spending more than you earn
          </li>
          <li>
            <strong>Net Worth View (Assets & Liabilities):</strong> Tracks everything you own vs. everything
            you owe to see your financial position at a point in time
          </li>
        </ul>
      </div>

      {/* Income */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-green-900 mb-3">💰 Income</h2>
        <p className="text-green-800 mb-3">
          <strong>Money coming in.</strong> Used for cash flow analysis to understand your earning potential.
        </p>

        <div className="bg-white rounded p-4 mb-4">
          <h4 className="font-semibold text-green-900 mb-2">✅ Examples that go here:</h4>
          <ul className="list-disc list-inside text-green-800 text-sm space-y-1">
            <li>Salary or wages</li>
            <li>Freelance or contract work</li>
            <li>Investment returns (dividends, interest, capital gains)</li>
            <li>Rental income</li>
            <li>Bonuses or commissions</li>
            <li>Gifts or inheritance</li>
            <li>Tax refunds</li>
          </ul>
        </div>

        <div className="bg-white rounded p-4">
          <h4 className="font-semibold text-red-900 mb-2">❌ Does NOT go here:</h4>
          <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
            <li>Loans or credit advances (not real income)</li>
            <li>Transfers between your own accounts</li>
          </ul>
        </div>
      </div>

      {/* Expenses */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">💸 Expenses</h2>
        <p className="text-blue-800 mb-3">
          <strong>Money going out for living costs and services.</strong> Used for cash flow analysis to understand
          your spending patterns.
        </p>

        <div className="bg-white rounded p-4 mb-4">
          <h4 className="font-semibold text-blue-900 mb-2">✅ Examples that go here:</h4>
          <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
            <li>Rent or housing payments (not mortgage principal)</li>
            <li>Groceries and dining</li>
            <li>Utilities (electricity, water, gas, internet)</li>
            <li>Gas/fuel for your car</li>
            <li>Insurance premiums (health, auto, home, life)</li>
            <li>Phone bill</li>
            <li>Gym membership or subscriptions</li>
            <li>Childcare or education</li>
            <li>Healthcare and medical expenses</li>
            <li>Entertainment</li>
            <li>Debt payments (credit card minimum, loan payment)</li>
          </ul>
        </div>

        <div className="bg-white rounded p-4">
          <h4 className="font-semibold text-red-900 mb-2">❌ Does NOT go here:</h4>
          <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
            <li>Mortgage payments (goes in Liabilities)</li>
            <li>Car loan payments (goes in Liabilities)</li>
            <li>Credit card balance (goes in Liabilities)</li>
            <li>Transfers between your own accounts</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
          <p className="text-yellow-800 text-sm">
            <strong>💡 Key Distinction:</strong> Track the monthly <strong>payment amount</strong> as an expense,
            while the total <strong>debt balance</strong> goes in Liabilities.
          </p>
        </div>
      </div>

      {/* Assets */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-emerald-900 mb-3">🏠 Assets</h2>
        <p className="text-emerald-800 mb-3">
          <strong>Things of value that you own.</strong> Used for net worth calculation to understand your
          financial position.
        </p>

        <div className="bg-white rounded p-4 mb-4">
          <h4 className="font-semibold text-emerald-900 mb-2">✅ Examples that go here:</h4>
          <ul className="list-disc list-inside text-emerald-800 text-sm space-y-1">
            <li>Primary home (current market value)</li>
            <li>Rental property</li>
            <li>Car or vehicle (current value)</li>
            <li>Savings account balance</li>
            <li>Checking account balance</li>
            <li>Investment accounts (brokerage, index funds, stocks)</li>
            <li>Retirement accounts (401k, IRA, Roth IRA)</li>
            <li>Cryptocurrency holdings</li>
            <li>Valuable collectibles (jewelry, art, antiques)</li>
            <li>Loans you made to others (if significant)</li>
          </ul>
        </div>

        <div className="bg-white rounded p-4">
          <h4 className="font-semibold text-red-900 mb-2">❌ Does NOT go here:</h4>
          <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
            <li>Debts you owe (goes in Liabilities)</li>
            <li>Income amounts (goes in Income)</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
          <p className="text-yellow-800 text-sm">
            <strong>💡 Important:</strong> Use current market value, not purchase price. Update periodically
            (monthly or quarterly) to track how your net worth changes.
          </p>
        </div>
      </div>

      {/* Liabilities */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-red-900 mb-3">💳 Liabilities (Debts)</h2>
        <p className="text-red-800 mb-3">
          <strong>Money you owe to others.</strong> Used for net worth calculation to understand your financial
          obligations.
        </p>

        <div className="bg-white rounded p-4 mb-4">
          <h4 className="font-semibold text-red-900 mb-2">✅ Examples that go here:</h4>
          <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
            <li>Home mortgage</li>
            <li>Car loan or auto loan</li>
            <li>Student loans</li>
            <li>Personal loans</li>
            <li>Credit card balances</li>
            <li>Medical debt</li>
            <li>Lines of credit</li>
          </ul>
        </div>

        <div className="bg-white rounded p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ About Debt Payments:</h4>
          <p className="text-gray-800 text-sm mb-2">
            There's often confusion about debt payments. Here's the right way to track them:
          </p>
          <ul className="list-disc list-inside text-gray-800 text-sm space-y-1">
            <li>
              Track your monthly <strong>payment</strong> in Expenses (either under "Debt Payment" category or
              the specific category)
            </li>
            <li>Track the total <strong>balance owed</strong> in Liabilities</li>
            <li>Update the liability balance as the principal decreases</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
          <p className="text-yellow-800 text-sm">
            <strong>Example:</strong> If your car loan payment is $400/month, put "$400 Car Loan Payment" in
            Expenses. Put "Car Loan - Balance: $15,000" in Liabilities.
          </p>
        </div>
      </div>

      {/* Net Worth Formula */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-purple-900 mb-3">📈 How Net Worth is Calculated</h2>
        <div className="bg-white rounded p-4">
          <div className="font-mono text-center text-lg mb-4">
            <p className="text-green-700 font-semibold mb-2">Total Assets</p>
            <p className="text-2xl mb-3">−</p>
            <p className="text-red-700 font-semibold mb-2">Total Liabilities</p>
            <p className="text-2xl mb-3">=</p>
            <p className="text-purple-700 font-semibold">Net Worth</p>
          </div>
          <p className="text-gray-800 text-sm">
            Your net worth represents your true financial position. If you own a $300,000 house but owe
            $250,000 on the mortgage, your net worth from that property is $50,000.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">❓ Common Questions</h2>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: Should I track rent or mortgage in Expenses?</h4>
            <p className="text-gray-800 text-sm">
              <strong>Rent:</strong> Yes, put your monthly rent payment in Expenses. It's a cash outflow.
            </p>
            <p className="text-gray-800 text-sm mt-2">
              <strong>Mortgage:</strong> Track the monthly <strong>payment</strong> in Expenses, but track the
              total <strong>balance</strong> in Liabilities. The home itself goes in Assets.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: Where do credit card payments go?</h4>
            <p className="text-gray-800 text-sm">
              Track the monthly <strong>payment amount</strong> in Expenses (category: "Debt Payment" or appropriate
              category). Track the credit card <strong>balance owed</strong> in Liabilities.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: My car is worth $25,000 but I owe $20,000. How do I track this?</h4>
            <p className="text-gray-800 text-sm">
              <strong>Asset:</strong> Add "Car" for $25,000 (current value)
            </p>
            <p className="text-gray-800 text-sm mt-2">
              <strong>Liability:</strong> Add "Car Loan" for $20,000 (amount owed)
            </p>
            <p className="text-gray-800 text-sm mt-2">
              <strong>Net Worth from car:</strong> $25,000 − $20,000 = $5,000
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: How often should I update my assets?</h4>
            <p className="text-gray-800 text-sm">
              At minimum quarterly, but monthly is ideal. Update when you:
            </p>
            <ul className="list-disc list-inside text-gray-800 text-sm mt-2 space-y-1">
              <li>Receive investment statements</li>
              <li>Know your home's current market value</li>
              <li>Have significant changes in account balances</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: Should I include small items like my phone or laptop?</h4>
            <p className="text-gray-800 text-sm">
              Generally no—they depreciate quickly and aren't significant to your net worth. Focus on major assets
              like home, vehicles, and investments. You can include high-value collectibles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
