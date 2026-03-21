import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { tablesApi } from '../api/tables'
import type { ColumnType } from '../types'

// Список таблиц
export function useTablesQuery() {
  return useQuery({
    key: ['tables'],
    query: () => tablesApi.getAll(),
  })
}

// Одна таблица с колонками и строками
export function useTableQuery(id: () => number | null) {
  return useQuery({
    key: () => ['tables', id()],
    query: () => tablesApi.getById(id()!),
    enabled: () => id() != null,
  })
}

// Создать таблицу
export function useCreateTable() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (name: string) => tablesApi.create(name),
    onSettled: () => cache.invalidateQueries({ key: ['tables'] }),
  })
}

// Удалить таблицу
export function useDeleteTable() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (id: number) => tablesApi.delete(id),
    onSuccess: (_data, id) => {
      // Сначала убираем кеш этой таблицы — без рефетча
      cache.setQueryData(['tables', id], undefined)
      // Потом инвалидируем список
      cache.invalidateQueries({ key: ['tables'] })
    },
  })
}

// Добавить строку
export function useAddRow() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (tableId: number) => tablesApi.addRow(tableId),
    onSettled: (_data, _error, tableId) => cache.invalidateQueries({ key: ['tables', tableId] }),
  })
}

// Добавить столбец — та же проблема
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

// Upsert — добавь tableId в payload для инвалидации при ошибке
export function useUpsertValue() {
  const cache = useQueryCache()
  return useMutation({
    mutation: ({ rowId, columnId, value }: { rowId: number, columnId: number, value: string, tableId: number }) => tablesApi.upsertValue(rowId, columnId, value),
    onError: (_error, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}

// Удалить строку
export function useDeleteRow() {
  const cache = useQueryCache()
  return useMutation({
    mutation: ({ id }: { id: number, tableId: number }) => tablesApi.deleteRow(id),
    onSettled: (_data, _error, vars) => cache.invalidateQueries({ key: ['tables', vars.tableId] }),
  })
}
