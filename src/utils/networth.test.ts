import { describe, it, expect } from 'vitest';
import { calculateNetWorth } from './finance';

describe('Net Worth Calculations', () => {
  describe('calculateNetWorth', () => {
    it('should calculate positive net worth correctly', () => {
      const assets = [
        { currentValue: 100000 },
        { currentValue: 50000 },
        { currentValue: 25000 },
      ];
      const liabilities = [
        { currentBalance: 30000 },
        { currentBalance: 10000 },
      ];

      const result = calculateNetWorth(assets, liabilities);
      expect(result).toBe(135000);
    });

    it('should calculate negative net worth (underwater)', () => {
      const assets = [{ currentValue: 50000 }];
      const liabilities = [{ currentBalance: 100000 }];

      const result = calculateNetWorth(assets, liabilities);
      expect(result).toBe(-50000);
    });

    it('should handle empty assets', () => {
      const assets: { currentValue: number }[] = [];
      const liabilities = [{ currentBalance: 50000 }];

      const result = calculateNetWorth(assets, liabilities);
      expect(result).toBe(-50000);
    });

    it('should handle empty liabilities', () => {
      const assets = [{ currentValue: 100000 }];
      const liabilities: { currentBalance: number }[] = [];

      const result = calculateNetWorth(assets, liabilities);
      expect(result).toBe(100000);
    });

    it('should handle both empty', () => {
      const result = calculateNetWorth([], []);
      expect(result).toBe(0);
    });

    it('should handle zero values', () => {
      const assets = [{ currentValue: 0 }, { currentValue: 0 }];
      const liabilities = [{ currentBalance: 0 }];

      const result = calculateNetWorth(assets, liabilities);
      expect(result).toBe(0);
    });

    it('should handle decimal values', () => {
      const assets = [{ currentValue: 10500.75 }];
      const liabilities = [{ currentBalance: 3200.25 }];

      const result = calculateNetWorth(assets, liabilities);
      expect(result).toBeCloseTo(7300.5, 2);
    });

    it('should handle real-world scenario (house, car, savings vs mortgage, credit card)', () => {
      const assets = [
        { currentValue: 350000 }, // House
        { currentValue: 25000 }, // Car
        { currentValue: 15000 }, // Savings
      ];
      const liabilities = [
        { currentBalance: 250000 }, // Mortgage
        { currentBalance: 5000 }, // Credit card
      ];

      const result = calculateNetWorth(assets, liabilities);
      expect(result).toBe(135000);
    });
  });
});
