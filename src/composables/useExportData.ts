import { ref } from 'vue';
import { Notify } from 'quasar';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { z } from 'zod';

/**
 * Schema for validating export data
 */
const ExportDataSchema = z.array(z.record(z.unknown())).min(1, 'No data available to export');

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  columns?: string[];
  formatters?: Record<string, (value: unknown) => unknown>;
}

/**
 * Composable for exporting data to CSV and Excel formats
 * Handles client-side data transformation and file generation
 */
export function useExportData() {
  const isExporting = ref(false);
  const exportError = ref<string | null>(null);

  /**
   * Validates and normalizes data for export
   */
  const validateData = (data: unknown): unknown[] => {
    try {
      return ExportDataSchema.parse(data);
    } catch (error) {
      throw new Error(
        error instanceof z.ZodError
          ? error.errors[0].message
          : 'Invalid data format for export'
      );
    }
  };

  /**
   * Applies custom formatters to data
   */
  const formatData = (
    data: unknown[],
    formatters?: Record<string, (value: unknown) => unknown>
  ): unknown[] => {
    if (!formatters) return data;

    return data.map((row) => {
      if (typeof row !== 'object' || row === null) return row;

      const formattedRow: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        formattedRow[key] = formatters[key] ? formatters[key](value) : value;
      }
      return formattedRow;
    });
  };

  /**
   * Exports data to CSV format
   */
  const exportToCSV = (
    data: unknown[],
    filename = 'export.csv',
    options?: ExportOptions
  ): Promise<void> => {
    return Promise.resolve().then(() => {
      try {
        isExporting.value = true;
        exportError.value = null;

        const validatedData = validateData(data);
        const formattedData = formatData(
          validatedData,
          options?.formatters
        );

        if (formattedData.length === 0) {
          throw new Error('No data available to export');
        }

        const csv = Papa.unparse(formattedData);
        downloadFile(csv, filename, 'text/csv;charset=utf-8;');

        Notify.create({
          type: 'positive',
          message: `CSV exported successfully: ${filename}`,
          position: 'top',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to export CSV';
        exportError.value = message;
        Notify.create({
          type: 'negative',
          message,
          position: 'top',
        });
        throw error;
      } finally {
        isExporting.value = false;
      }
    });
  };

  /**
   * Exports data to Excel format
   */
  const exportToExcel = (
    data: unknown[],
    filename = 'export.xlsx',
    options?: ExportOptions
  ): Promise<void> => {
    return Promise.resolve().then(() => {
      try {
        isExporting.value = true;
        exportError.value = null;

        const validatedData = validateData(data);
        const formattedData = formatData(validatedData, options?.formatters);

        if (formattedData.length === 0) {
          throw new Error('No data available to export');
        }

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          options?.sheetName || 'Data'
        );

        // Auto-adjust column widths
        const colWidths = Object.keys(formattedData[0] || {}).map(() => 12);
        worksheet['!cols'] = colWidths.map((width) => ({ wch: width }));

        XLSX.writeFile(workbook, filename);

        Notify.create({
          type: 'positive',
          message: `Excel exported successfully: ${filename}`,
          position: 'top',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to export Excel';
        exportError.value = message;
        Notify.create({
          type: 'negative',
          message,
          position: 'top',
        });
        throw error;
      } finally {
        isExporting.value = false;
      }
    });
  };

  /**
   * Helper function to download file
   */
  const downloadFile = (
    content: string,
    filename: string,
    contentType: string
  ): void => {
    const link = document.createElement('a');
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /**
   * Formats a date value for export
   */
  const formatDate = (date: unknown): string => {
    if (!date) return '';
    const d = new Date(date as string | number);
    return d.toLocaleDateString('es-ES');
  };

  /**
   * Formats a currency value for export
   */
  const formatCurrency = (value: unknown): string => {
    if (!value) return '';
    const num = typeof value === 'string' ? parseFloat(value) : (value as number);
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  return {
    isExporting,
    exportError,
    exportToCSV,
    exportToExcel,
    formatDate,
    formatCurrency,
  };
}
