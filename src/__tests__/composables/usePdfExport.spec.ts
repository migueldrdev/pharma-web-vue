import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePdfExport } from '@composables/usePdfExport';
import { Notify } from 'quasar';

vi.mock('quasar', () => ({
  Notify: {
    create: vi.fn(),
  },
}));

vi.mock('@/boot/axios', () => {
  const post = vi.fn();
  return {
    api: {
      post,
    },
  };
});

import { api } from '@/boot/axios';

describe('usePdfExport', () => {
  let usePdf: ReturnType<typeof usePdfExport>;

  beforeEach(() => {
    usePdf = usePdfExport();
    vi.clearAllMocks();
  });

  describe('PDF Export Request', () => {
    it('should successfully request PDF export', async () => {
      const mockBlob = new Blob(['PDF Content']);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockBlob } as never);

      const request = {
        type: 'sales' as const,
        filters: { dateFrom: '2024-01-01' },
      };

      const result = await usePdf.requestPdfExport(request);
      expect(result).toBe(mockBlob);
    });

    it('should reject invalid export type', async () => {
      const request = { type: 'invalid' as never };

      await expect(usePdf.requestPdfExport(request)).rejects.toThrow();
      // Error should be set after rejection
      expect(usePdf.exportError.value).toBeDefined();
    });

    it('should handle API errors', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Network error'));

      const request = { type: 'sales' as const };

      await expect(usePdf.requestPdfExport(request)).rejects.toThrow();
      expect(usePdf.exportError.value).toBe('Network error');
    });
  });

  describe('PDF Download', () => {
    it('should download PDF file', () => {
      const mockBlob = new Blob(['PDF Content']);
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();

      usePdf.downloadPdf(mockBlob, 'test.pdf');

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      const notifyCreateMock = Notify.create as unknown as ReturnType<typeof vi.fn>;
      expect(notifyCreateMock).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should initialize with correct values', () => {
      const fresh = usePdfExport();

      expect(fresh.isExporting.value).toBe(false);
      expect(fresh.exportProgress.value).toBe(0);
      expect(fresh.exportError.value).toBeNull();
    });
  });
});

