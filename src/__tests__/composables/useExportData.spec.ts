import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useExportData } from '@composables/useExportData';
import { Notify } from 'quasar';

vi.mock('quasar', () => ({
  Notify: {
    create: vi.fn(),
  },
}));

describe('useExportData', () => {
  let useExport: ReturnType<typeof useExportData>;

  beforeEach(() => {
    useExport = useExportData();
    vi.clearAllMocks();
  });

  describe('CSV Export', () => {
    it('should export valid data to CSV', async () => {
      const testData = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];

      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();

      await useExport.exportToCSV(testData, 'test.csv');

      expect(useExport.isExporting.value).toBe(false);
      expect(useExport.exportError.value).toBeNull();
      expect(Notify.create).toHaveBeenCalled();
    });

    it('should throw error for empty data', async () => {
      const testData: unknown[] = [];

      await expect(useExport.exportToCSV(testData)).rejects.toThrow();
      expect(useExport.exportError.value).toBeTruthy();
    });
  });

  describe('Excel Export', () => {
    it('should export valid data to Excel', async () => {
      const testData = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];

      await useExport.exportToExcel(testData, 'test.xlsx');

      expect(useExport.isExporting.value).toBe(false);
      expect(useExport.exportError.value).toBeNull();
    });

    it('should throw error for empty data', async () => {
      const testData: unknown[] = [];

      await expect(useExport.exportToExcel(testData)).rejects.toThrow();
    });
  });

  describe('Formatters', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = useExport.formatDate(date);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should format currency correctly', () => {
      const value = 1234.56;
      const formatted = useExport.formatCurrency(value);

      expect(formatted).toContain('1');
    });
  });
});
