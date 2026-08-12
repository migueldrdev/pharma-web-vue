import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  numFmt?: string;
  align?: 'left' | 'center' | 'right';
}

interface ExcelExportOptions {
  filename: string;
  sheetName: string;
  columns: ExcelColumn[];
  data: Record<string, unknown>[];
  title?: string;
  subtitle?: string;
  footerSummary?: (data: Record<string, unknown>[]) => Partial<Record<string, string | number>>;
}

const HEADER_BG = 'FF1976D2';
const HEADER_FG = 'FFFFFFFF';
const ZEBRA_BG = 'FFF5F5F5';
const FONT_FAMILY = 'Arial';

export function useExcelExport() {
  function applyHeaderStyle(sheet: ExcelJS.Worksheet, colCount: number, offset: number): void {
    const headerRow = sheet.getRow(1 + offset);
    headerRow.font = { name: FONT_FAMILY, bold: true, size: 11, color: { argb: HEADER_FG } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: HEADER_BG },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 28;

    for (let c = 1; c <= colCount; c++) {
      headerRow.getCell(c).border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
  }

  function addTitleRow(
    sheet: ExcelJS.Worksheet,
    row: number,
    text: string,
    colCount: number,
    size: number = 16,
  ): void {
    const titleRow = sheet.getRow(row);
    titleRow.getCell(1).value = text;
    titleRow.getCell(1).font = { name: FONT_FAMILY, bold: true, size, color: { argb: 'FF333333' } };
    titleRow.height = size * 2;
    sheet.mergeCells(row, 1, row, colCount);
  }

  function applyRowStyle(
    row: ExcelJS.Row,
    colCount: number,
    isEven: boolean,
    columns: ExcelColumn[],
  ): void {
    if (isEven) {
      for (let c = 1; c <= colCount; c++) {
        row.getCell(c).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: ZEBRA_BG },
        };
      }
    }

    for (let c = 0; c < columns.length; c++) {
      const colDef = columns[c];
      if (!colDef) continue;
      const cell = row.getCell(c + 1);
      cell.font = { name: FONT_FAMILY, size: 10 };
      if (colDef.numFmt) cell.numFmt = colDef.numFmt;
      if (colDef.align)
        cell.alignment = { horizontal: colDef.align };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
    }
  }

  async function exportToExcel(options: ExcelExportOptions): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PharmaCare';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet(options.sheetName);

    let dataStartRow = 0;

    // Título
    if (options.title) {
      dataStartRow++;
      addTitleRow(sheet, dataStartRow, options.title, options.columns.length, 16);
    }

    // Subtítulo
    if (options.subtitle) {
      dataStartRow++;
      addTitleRow(sheet, dataStartRow, options.subtitle, options.columns.length, 11);
    }

    // Espacio después del título
    if (dataStartRow > 0) dataStartRow++;

    // Header de columnas
    sheet.columns = options.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width ?? 15,
      style: col.numFmt ? { numFmt: col.numFmt } : {},
    }));

    applyHeaderStyle(sheet, options.columns.length, dataStartRow);

    // Datos
    options.data.forEach((rowData, index) => {
      const row = sheet.addRow(rowData);
      applyRowStyle(row, options.columns.length, index % 2 === 0, options.columns);
    });

    // Footer summary
    if (options.footerSummary) {
      const footerData = options.footerSummary(options.data);
      const footerRow = sheet.addRow(footerData);
      footerRow.font = { name: FONT_FAMILY, bold: true, size: 11 };
      for (let c = 1; c <= options.columns.length; c++) {
        footerRow.getCell(c).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8EAF6' },
        };
        footerRow.getCell(c).border = {
          top: { style: 'medium' },
          bottom: { style: 'medium' },
        };
      }
      footerRow.height = 30;
    }

    // Auto-ajustar ancho de columnas
    sheet.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const val = cell.value;
        const len =
          typeof val === 'string'
            ? val.length
            : typeof val === 'number' || typeof val === 'boolean'
              ? String(val).length
              : 0;
        if (len > maxLen) maxLen = len;
      });
      if (column.width && maxLen > 0) {
        column.width = Math.min(Math.max(column.width, maxLen + 4), 55);
      }
    });

    // Generar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${options.filename}.xlsx`);
  }

  return { exportToExcel };
}
