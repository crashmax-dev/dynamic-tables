import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { tablesApi } from '@/api/tables'
import type { ColumnType } from '@/types'

export function useTablesQuery() {
  return useQuery({
    key: ['tables'],
    query: () => tablesApi.getAll(),
  })
}

export function useTableQuery(id: () => number | null) {
  return useQuery({
    key: () => ['tables', id()],
    query: () => tablesApi.getById(id()!),
    enabled: () => id() != null,
  })
}

export function useCreateTable() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (name: string) => tablesApi.create(name),
    onSettled: () => cache.invalidateQueries({ key: ['tables'] }),
  })
}

export function useDeleteTable() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (id: number) => tablesApi.delete(id),
    onSuccess: (_data, id) => {
      cache.setQueryData(['tables', id], undefined)
      cache.invalidateQueries({ key: ['tables'] })
    },
  })
}

export function useAddRow() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (tableId: number) => tablesApi.addRow(tableId),
    onSettled: (_data, _error, tableId) => cache.invalidateQueries({ key: ['tables', tableId] }),
  })
}

export function useAddColumn() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (data: {
      tableId: number
      name: string
      type: ColumnType
      options?: { label: string, color?: string }[]
    }) => tablesApi.addColumn(data),
    onSettled: (_data, _error, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}

export function useUpdateColumn() {
  const cache = useQueryCache()
  return useMutation({
    mutation: ({
      id,
      data,
    }: {
      id: number
      tableId: number
      data: { name?: string, visible?: boolean, order?: number }
    }) => tablesApi.updateColumn(id, data),
    onSuccess: (_result, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}

export function useReorderColumns() {
  const cache = useQueryCache()
  return useMutation({
    mutation: ({ orderedIds }: { tableId: number, orderedIds: number[] }) => tablesApi.reorderColumns(orderedIds),
    onSettled: (_data, _error, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}

export function useReorderRows() {
  const cache = useQueryCache()
  return useMutation({
    mutation: ({ orderedIds }: { tableId: number, orderedIds: number[] }) => tablesApi.reorderRows(orderedIds),
    onSettled: (_data, _error, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}

export function useUpsertValue() {
  const cache = useQueryCache()
  return useMutation({
    mutation: ({
      rowId,
      columnId,
      value,
    }: {
      rowId: number
      columnId: number
      value: string
      tableId: number
    }) => tablesApi.upsertValue(rowId, columnId, value),
    onError: (_error, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}

export function useDeleteRow() {
  const cache = useQueryCache()
  return useMutation({
    mutation: ({ id }: { id: number, tableId: number }) => tablesApi.deleteRow(id),
    onSettled: (_data, _error, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}
