import type { QTableColumn, QTableProps } from 'quasar'

export interface AppDataTableColumn<T = Record<string, unknown>> {
  name: string
  label: string
  field: string | ((row: T) => unknown)
  align?: QTableColumn['align']
  sortable?: boolean
  sort?: QTableColumn['sort']
  format?: (val: unknown, row: T) => string
  style?: string
  classes?: string
}

export interface AppDataTableFilter {
  name: string
  label: string
  type: 'text' | 'select' | 'date' | 'number'
  model: unknown
  options?: { label: string; value: string | number }[]
  clearable?: boolean
  dense?: boolean
  style?: string
}

export interface TableParams {
  pagination: {
    page: number
    rowsPerPage: number
    sortBy?: string
    descending?: boolean
    rowsNumber?: number
  }
  filter?: string | undefined
}

export interface TableResponse<T = Record<string, unknown>> {
  data: T[]
  total: number
  current_page?: number
  per_page?: number
}

export interface AppDataTableAction<T = Record<string, unknown>> {
  name: string
  label: string
  icon: string
  color?: string
  flat?: boolean
  round?: boolean
  dense?: boolean
  condition?: (row: T) => boolean
}
