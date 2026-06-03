<template>
  <div class="export-buttons-container">
    <div class="q-gutter-md">
      <!-- CSV Export Button -->
      <q-btn
        flat
        dense
        icon="mdi-file-delimited"
        label="CSV"
        color="primary"
        @click="handleCsvExport"
        :disable="!data || data.length === 0 || isExportingCsv"
        :loading="isExportingCsv"
        class="export-btn"
        title="Export data as CSV file"
      />

      <!-- Excel Export Button -->
      <q-btn
        flat
        dense
        icon="mdi-file-excel"
        label="Excel"
        color="positive"
        @click="handleExcelExport"
        :disable="!data || data.length === 0 || isExportingExcel"
        :loading="isExportingExcel"
        class="export-btn"
        title="Export data as Excel file"
      />

      <!-- PDF Export Button -->
      <q-btn
        v-if="showPdfExport"
        flat
        dense
        icon="mdi-file-pdf"
        label="PDF"
        color="negative"
        @click="handlePdfExport"
        :disable="isExportingPdf"
        :loading="isExportingPdf"
        class="export-btn"
        title="Export data as PDF file"
      />

      <!-- PDF Export Progress -->
      <q-linear-progress
        v-if="isExportingPdf && showPdfExport"
        :value="pdfExportProgress / 100"
        color="negative"
        class="q-mt-md"
        stripe
        :indeterminate="isExportingPdf && pdfExportProgress === 0"
      />
    </div>

    <!-- PDF Export Options Dialog -->
    <q-dialog v-model="showPdfDialog" @hide="resetPdfFilters">
      <q-card class="pdf-export-dialog" style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Export to PDF</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <slot name="pdf-filters">
            <p class="text-caption text-grey">
              Use default filters to generate the PDF report.
            </p>
          </slot>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            label="Export"
            color="negative"
            @click="proceedPdfExport"
            :disable="isExportingPdf"
            :loading="isExportingPdf"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useExportData } from '@composables/useExportData';
import { usePdfExport } from '@composables/usePdfExport';
import type { PdfExportRequest } from '@composables/usePdfExport';

interface Props {
  data?: unknown[];
  filename?: string;
  sheetName?: string;
  showPdfExport?: boolean;
  pdfExportType?: 'sales' | 'inventory' | 'financial' | 'purchases';
  pdfExportFilters?: Record<string, unknown>;
}

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  filename: 'export',
  sheetName: 'Sheet1',
  showPdfExport: false,
  pdfExportType: 'sales',
  pdfExportFilters: () => ({}),
});

const { exportToCSV, exportToExcel, isExporting: isExportingData } =
  useExportData();
const { exportAndDownload, isExporting: isExportingPdf, exportProgress: pdfExportProgress } =
  usePdfExport();

const isExportingCsv = ref(false);
const isExportingExcel = ref(false);
const showPdfDialog = ref(false);
const pendingPdfRequest = ref<PdfExportRequest | null>(null);

const hasCsvData = computed(() => props.data && props.data.length > 0);
const hasExcelData = computed(() => props.data && props.data.length > 0);

/**
 * Handle CSV export
 */
const handleCsvExport = async () => {
  if (!hasCsvData.value) return;

  try {
    isExportingCsv.value = true;
    await exportToCSV(props.data as unknown[], `${props.filename}.csv`);
  } catch (error) {
    console.error('CSV export failed:', error);
  } finally {
    isExportingCsv.value = false;
  }
};

/**
 * Handle Excel export
 */
const handleExcelExport = async () => {
  if (!hasExcelData.value) return;

  try {
    isExportingExcel.value = true;
    await exportToExcel(props.data as unknown[], `${props.filename}.xlsx`, {
      sheetName: props.sheetName,
    });
  } catch (error) {
    console.error('Excel export failed:', error);
  } finally {
    isExportingExcel.value = false;
  }
};

/**
 * Handle PDF export - show dialog
 */
const handlePdfExport = () => {
  showPdfDialog.value = true;
};

/**
 * Proceed with PDF export after dialog confirmation
 */
const proceedPdfExport = async () => {
  const request: PdfExportRequest = {
    type: props.pdfExportType as 'sales' | 'inventory' | 'financial' | 'purchases',
    filters: props.pdfExportFilters,
    filename: `${props.filename}.pdf`,
  };

  try {
    await exportAndDownload(request);
    showPdfDialog.value = false;
  } catch (error) {
    console.error('PDF export failed:', error);
  }
};

/**
 * Reset PDF filters when dialog closes
 */
const resetPdfFilters = () => {
  pendingPdfRequest.value = null;
};
</script>

<style scoped lang="scss">
.export-buttons-container {
  .export-btn {
    white-space: nowrap;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }

  .pdf-export-dialog {
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.12);
  }
}
</style>
