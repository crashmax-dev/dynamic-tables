export type ColumnType = 'text' | 'number' | 'select' | 'toggle' | 'date'

export interface ColumnOption {
  id: number
  label: string
  color?: string
}

export interface TableColumn {
  id: number
  name: string
  type: ColumnType
  order: number
  options?: ColumnOption[] // только для select
}

export interface CellValue {
  columnId: number
  value: string | null
}

export interface TableRow {
  id: number
  values: CellValue[]
}

export interface DynamicTable {
  id: number
  name: string
  columns: TableColumn[]
  rows: TableRow[]
}
