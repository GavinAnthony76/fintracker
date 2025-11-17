import { describe, it, expect } from 'vitest';
import {
  frequencyMultipliers,
  calculateNetWorth,
  monthlyEquivalent,
  calculateCashFlow,
  formatCurrency,
  formatPercentage,
} from './finance';

describe('Finance Utilities', () => {
  describe('frequencyMultipliers', () => {
    it('should have correct multipliers for all frequencies', () => {
      expect(frequencyMultipliers.daily).toBeCloseTo(30.44, 1);
      expect(frequencyMultipliers.weekly).toBeCloseTo(4.33, 1);
      expect(frequencyMultipliers['bi-weekly']).toBeCloseTo(2.17, 1);
      expect(frequencyMultipliers['semi-monthly']).toBe(2);
      expect(frequencyMultipliers.monthly).toBe(1);
      expect(frequencyMultipliers.quarterly).toBeCloseTo(1 / 3, 2);
      expect(frequencyMultipliers.annually).toBeCloseTo(1 / 12, 2);
      expect(frequencyMultipliers['one-time']).toBe(0);
    });
  });

  describe('monthlyEquivalent', () => {
    it('should convert weekly amount to monthly', () => {
      const result = monthlyEquivalent(100, 'weekly');
      expect(result).toBeCloseTo(433, 0);
    });

    it('should convert annual amount to monthly', () => {
      const result = monthlyEquivalent(1200, 'annually');
      expect(result).toBeCloseTo(100, 0);
    });

    it('should return same amount for monthly frequency', () => {
      const result = monthlyEquivalent(500, 'monthly');
      expect(result).toBe(500);
    });

    it('should return 0 for one-time frequency', () => {
      const result = monthlyEquivalent(1000, 'one-time');
      expect(result).toBe(0);
    });
  });

  describe('calculateNetWorth', () => {
    it('should calculate net worth correctly', () => {
      const assets = [
        { currentValue: 100000 },
        { currentValue: 50000 },
      ];
      const liabilities = [
        { currentBalance: 30000 },
        { currentBalance: 20000 },
      ];

      const result = calculateNetWorth(assets, liabilities);
      expect(result).toBe(100000);
    });

    it('should handle empty arrays', () => {
      const result = calculateNetWorth([], []);
      expect(result).toBe(0);
    });

    it('should handle negative net worth', () => {
      const assets = [{ currentValue: 50000 }];
      const liabilities = [{ currentBalance: 100000 }];

      const result = calculateNetWorth(assets, liabilities);
      expect(result).toBe(-50000);
    });
  });

  describe('calculateCashFlow', () => {
    it('should calculate positive cash flow', () => {
      const incomes = [
        { amount: 5000, frequency: 'monthly' as const, isActive: true },
      ];
      const expenses = [
        { amount: 3000, frequency: 'monthly' as const, isActive: true },
      ];

      const result = calculateCashFlow(incomes, expenses);
      expect(result).toBe(2000);
    });

    it('should calculate negative cash flow', () => {
      const incomes = [
        { amount: 3000, frequency: 'monthly' as const, isActive: true },
      ];
      const expenses = [
        { amount: 5000, frequency: 'monthly' as const, isActive: true },
      ];

      const result = calculateCashFlow(incomes, expenses);
      expect(result).toBe(-2000);
    });

    it('should ignore inactive items', () => {
      const incomes = [
        { amount: 5000, frequency: 'monthly' as const, isActive: true },
        { amount: 2000, frequency: 'monthly' as const, isActive: false },
      ];
      const expenses = [
        { amount: 3000, frequency: 'monthly' as const, isActive: true },
        { amount: 1000, frequency: 'monthly' as const, isActive: false },
      ];

      const result = calculateCashFlow(incomes, expenses);
      expect(result).toBe(2000); // 5000 - 3000
    });

    it('should handle multiple frequencies', () => {
      const incomes = [
        { amount: 500, frequency: 'weekly' as const, isActive: true }, // ~2165/month
        { amount: 2000, frequency: 'monthly' as const, isActive: true },
      ];
      const expenses = [
        { amount: 3000, frequency: 'monthly' as const, isActive: true },
      ];

      const result = calculateCashFlow(incomes, expenses);
      expect(result).toBeCloseTo(1165, 0);
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      const result = formatCurrency(1234.56, 'USD');
      expect(result).toMatch(/\$1,234\.56/);
    });

    it('should default to USD', () => {
      const result = formatCurrency(1000);
      expect(result).toMatch(/\$/);
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toMatch(/\$0/);
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-500);
      expect(result).toMatch(/-.*\$500/);
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      const result = formatPercentage(0.5);
      expect(result).toBe('50.00%');
    });

    it('should respect decimal places', () => {
      const result = formatPercentage(0.333, 1);
      expect(result).toBe('33.3%');
    });

    it('should handle zero', () => {
      const result = formatPercentage(0);
      expect(result).toBe('0.00%');
    });

    it('should handle values over 100%', () => {
      const result = formatPercentage(1.5);
      expect(result).toBe('150.00%');
    });
  });
});
