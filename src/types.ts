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
  visible: boolean
  options?: ColumnOption[]
}

export interface CellValue {
  columnId: number
  value: string | null
}

export interface TableRow {
  id: number
  order: number
  values: CellValue[]
}

export interface DynamicTable {
  id: number
  name: string
  columns: TableColumn[]
  rows: TableRow[]
}

export interface TableUiState {
  columnOrder: string[]
  sorting: {
    id: string
    desc: boolean
  }[]
  pagination: {
    pageIndex: number
    pageSize: number
  }
}
