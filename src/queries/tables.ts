import {
  useMutation,
  useQuery,
  useQueryCache,
} from '@pinia/colada'
import {
  deleteApiRowsById,
  deleteApiTablesById,
  getApiTables,
  getApiTablesById,
  patchApiColumnsById,
  patchApiColumnsReorder,
  patchApiRowsReorder,
  postApiColumns,
  postApiRows,
  postApiTables,
  putApiRowsByRowIdValues,
} from '@/api'
import type { ColumnType } from '@/types'

export function useTablesQuery() {
  return useQuery({
    key: ['tables'],
    query: () => getApiTables(),
  })
}

export function useTableQuery(id: () => number | null) {
  return useQuery({
    key: () => ['tables', id()],
    query: () => getApiTablesById({
      path: { id: id() },
    }),
    enabled: () => id() !== null,
  })
}

export function useCreateTable() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (name: string) => postApiTables({
      body: { name },
    }),
    onSettled: () => cache.invalidateQueries({ key: ['tables'] }),
  })
}

export function useDeleteTable() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (id: number) => deleteApiTablesById({
      path: { id },
    }),
    onSuccess: (_data, id) => {
      cache.setQueryData(['tables', id], undefined)
      cache.invalidateQueries({ key: ['tables'] })
    },
  })
}

export function useAddRow() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (tableId: number) => postApiRows({
      body: { tableId },
    }),
    onSettled: (_data, _error, tableId) => cache.invalidateQueries({ key: ['tables', tableId] }),
  })
}

export function useAddColumn() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (body: {
      tableId: number
      name: string
      type: ColumnType
      options?: { label: string, color?: string }[]
    }) => postApiColumns({ body }),
    onSettled: (_data, _error, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}

export function useUpdateColumn() {
  const cache = useQueryCache()
  return useMutation({
    mutation: ({
      id,
      body,
    }: {
      id: number
      tableId: number
      body: { name?: string, visible?: boolean, order?: number }
    }) => patchApiColumnsById({
      path: { id },
      body,
    }),
    onSuccess: (_result, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}

export function useReorderColumns() {
  const cache = useQueryCache()
  return useMutation({
    mutation: ({ orderedIds }: { tableId: number, orderedIds: number[] }) => patchApiColumnsReorder({
      body: { orderedIds },
    }),
    onSettled: (_data, _error, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}

export function useReorderRows() {
  const cache = useQueryCache()
  return useMutation({
    mutation: ({ orderedIds }: { tableId: number, orderedIds: number[] }) => patchApiRowsReorder({
      body: { orderedIds },
    }),
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
    }) => putApiRowsByRowIdValues({
      path: { rowId },
      body: {
        value,
        columnId,
      },
    }),
    onError: (_error, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}

export function useDeleteRow() {
  const cache = useQueryCache()
  return useMutation({
    mutation: ({ id }: { id: number, tableId: number }) => deleteApiRowsById({
      path: { id },
    }),
    onSettled: (_data, _error, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}
