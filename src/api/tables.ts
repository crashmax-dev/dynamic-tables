import { api } from './client'
import type {
  ColumnType,
  DynamicTable,
  TableColumn,
} from '../types'

export interface TableMeta {
  id: number
  name: string
  createdAt: string
}

export const tablesApi = {
  getAll: () => api.get<TableMeta[]>('/tables'),

  getById: (id: number) => api.get<DynamicTable>(`/tables/${id}`),

  create: (name: string) => api.post<TableMeta>('/tables', { name }),

  delete: (id: number) => api.delete<{ ok: boolean }>(`/tables/${id}`),

  addColumn: (data: {
    tableId: number
    name: string
    type: ColumnType
    options?: { label: string, color?: string }[]
  }) => api.post<TableColumn>('/columns', data),

  deleteColumn: (id: number) => api.delete<{ ok: boolean }>(`/columns/${id}`),

  addRow: (tableId: number) => api.post<{ id: number, tableId: number, values: [] }>('/rows', { tableId }),

  deleteRow: (id: number) => api.delete<{ ok: boolean }>(`/rows/${id}`),

  upsertValue: (rowId: number, columnId: number, value: string) => api.put<{ ok: boolean }>(`/rows/${rowId}/values`, { columnId, value }),
}
