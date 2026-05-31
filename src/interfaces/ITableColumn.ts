export interface ITableColumn<TRow = Record<string, unknown>> {
  name: string;
  label: string;
  field: string | ((row: TRow) => string | number);
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  required?: boolean;
  format?: (val: string | number, row: TRow) => string;
  style?: string;
  classes?: string;
  headerStyle?: string;
  headerClasses?: string;
}
