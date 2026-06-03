import { ref } from 'vue';
import { Notify } from 'quasar';
import { api } from '@/boot/axios';
import { z } from 'zod';

/**
 * Schema for PDF export request validation
 */
const PdfExportRequestSchema = z.object({
  type: z.enum(['sales', 'inventory', 'financial', 'purchases'], {
    errorMap: () => ({ message: 'Invalid export type' }),
  }),
  filters: z.record(z.unknown()).optional(),
  filename: z.string().optional(),
});

export type PdfExportType = 'sales' | 'inventory' | 'financial' | 'purchases';

export interface PdfExportRequest {
  type: PdfExportType;
  filters?: Record<string, unknown>;
  filename?: string;
}

/**
 * Composable for requesting PDF exports from the backend
 * Handles API communication and file download
 */
export function usePdfExport() {
  const isExporting = ref(false);
  const exportProgress = ref(0);
  const exportError = ref<string | null>(null);

  /**
   * Requests PDF export from the backend API
   */
  const requestPdfExport = async (request: PdfExportRequest): Promise<Blob> => {
    try {
      isExporting.value = true;
      exportProgress.value = 0;
      exportError.value = null;

      // Validate request
      const validatedRequest = PdfExportRequestSchema.parse(request);

      // Make API request
      const response = await api.post<Blob>(
        '/exports/pdf',
        {
          type: validatedRequest.type,
          filters: validatedRequest.filters || {},
        },
        {
          responseType: 'blob',
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              exportProgress.value = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
            }
          },
        }
      );

      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data;
    } catch (error) {
      const message =
        error instanceof z.ZodError
          ? error.errors[0].message
          : error instanceof Error
            ? error.message
            : 'Failed to export PDF';

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
  };

  /**
   * Downloads the PDF file
   */
  const downloadPdf = (blob: Blob, filename = 'export.pdf'): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    Notify.create({
      type: 'positive',
      message: `PDF downloaded successfully: ${filename}`,
      position: 'top',
    });
  };

  /**
   * Complete export flow: request and download
   */
  const exportAndDownload = async (request: PdfExportRequest): Promise<void> => {
    const blob = await requestPdfExport(request);
    const filename = request.filename || `${request.type}-report.pdf`;
    downloadPdf(blob, filename);
  };

  return {
    isExporting,
    exportProgress,
    exportError,
    requestPdfExport,
    downloadPdf,
    exportAndDownload,
  };
}
