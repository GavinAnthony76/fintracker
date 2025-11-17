import { describe, it, expect } from 'vitest';
import { parseCSV, detectCSVType } from './csvParser';

describe('CSV Parser - Financial Statement with Monthly Columns', () => {
  it('should extract monthly transactions from financial statement format', () => {
    const csv = `Account Name,Jan 2025,Feb 2025,Mar 2025,Total
Income
Salary,5000,5000,5000,15000
Freelance,1000,2000,1500,4500
Expense
Rent,2000,2000,2000,6000
Utilities,300,350,320,970`;

    const result = parseCSV(csv);

    // Should create monthly rows, not just total rows
    expect(result.format).toBe('financial-statement');
    // Salary (3) + Freelance (3) + Rent (3) + Utilities (3) = 12 rows
    expect(result.rows.length).toBe(12);

    // Check for monthly breakdown
    const salaryRows = result.rows.filter(r => r.Name === 'Salary');
    expect(salaryRows.length).toBe(3); // One for each month

    // Verify each month has correct date
    const dates = salaryRows.map(r => r['Transaction Date']).sort();
    expect(dates).toContain('2025-01-01');
    expect(dates).toContain('2025-02-01');
    expect(dates).toContain('2025-03-01');

    // Verify amounts match the monthly values (not totals)
    const janSalary = salaryRows.find(r => r['Transaction Date'] === '2025-01-01');
    expect(janSalary?.Amount).toBe('5000');
  });

  it('should preserve transaction dates for bank statements', () => {
    const csv = `Date,Description,Amount
2025-11-15,Salary Deposit,5000
2025-11-16,Gas Station,-50
2025-11-17,Grocery Store,-120`;

    const result = parseCSV(csv);

    expect(result.format).toBe('bank-statement');
    expect(result.rows.length).toBe(3);

    // Check that dates are in the rows
    expect(result.rows[0]['Date']).toBeDefined();
  });

  it('should handle financial statement with zero values', () => {
    const csv = `Account Name,Jan 2025,Feb 2025,Total
Expense
Rent,3000,3000,6000
Entertainment,0,100,100`;

    const result = parseCSV(csv);

    expect(result.format).toBe('financial-statement');

    // Should skip the zero value for Entertainment in Jan 2025
    const entertainmentRows = result.rows.filter(r => r.Name === 'Entertainment');
    expect(entertainmentRows.length).toBe(1); // Only Feb 2025
    expect(entertainmentRows[0]['Transaction Date']).toBe('2025-02-01');
  });

  it('should detect type correctly', () => {
    const incomeExpenseCSV = `Type,Name,Amount,Frequency
Income,Salary,5000,monthly
Expense,Rent,2000,monthly`;

    const headers = ['Type', 'Name', 'Amount', 'Frequency'];
    const type = detectCSVType(headers);
    expect(type).toBe('income-expense');
  });
});

describe('CSV Parser - Month Extraction', () => {
  it('should extract month from "Jan 2025" format', () => {
    const csv = `Account,Jan 2025,Feb 2025,Total
Income
Salary,5000,5000,10000`;

    const result = parseCSV(csv);
    expect(result.rows.length).toBeGreaterThanOrEqual(2);
    expect(result.rows.some(r => r['Month'] === 'Jan 2025')).toBe(true);
    expect(result.rows.some(r => r['Month'] === 'Feb 2025')).toBe(true);
  });

  it('should extract month from "January 2025" format', () => {
    const csv = `Account,January 2025,February 2025,Total
Expense
Rent,2000,2000,4000`;

    const result = parseCSV(csv);
    expect(result.rows.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle accounting notation for negative values', () => {
    const csv = `Account,Jan 2025,Feb 2025,Total
Expense
Refund,(500),0,(500)`;

    const result = parseCSV(csv);

    const refundRows = result.rows.filter(r => r.Name === 'Refund');
    expect(refundRows.length).toBe(1); // Only Jan has non-zero value
    expect(refundRows[0]['Amount']).toBe('-500');
  });
});
