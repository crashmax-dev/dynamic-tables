import type { TableColumn } from './types'

export interface TableMeta {
  column: TableColumn
  label: string
  type: string
}

declare module '@tanstack/vue-table' {
  interface ColumnMeta<TData, TValue> extends TableMeta {}
}
