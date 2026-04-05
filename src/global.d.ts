import type { GetApiTablesByIdResponses } from './api'

export interface TableMeta {
  column: GetApiTablesByIdResponses['200'][0]
  label: string
  type: string
}

declare module '@tanstack/vue-table' {
  interface ColumnMeta<TData, TValue> extends TableMeta {}
}
