import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import type { TableUiState } from '../types'

const DEFAULT_PAGE_SIZE = 100

export const useTableStore = defineStore('use-table-store', () => {
  const allStates = useLocalStorage<Record<number, TableUiState>>('table-store', {})

  function getState(tableId: number, columnIds: string[]): TableUiState {
    const existing = allStates.value[tableId]
    if (existing) {
      const missing = columnIds.filter(id => !existing.columnOrder.includes(id))
      if (missing.length) {
        existing.columnOrder.push(...missing)
        allStates.value[tableId] = existing
      }
      return existing
    }

    return {
      columnOrder: columnIds,
      sorting: [],
      pagination: {
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE,
      },
    }
  }

  function setState(tableId: number, patch: Partial<TableUiState>) {
    const current = allStates.value[tableId] ?? {
      columnOrder: [],
      sorting: [],
      pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
    }
    allStates.value[tableId] = { ...current, ...patch }
  }

  function resetState(tableId: number) {
    delete allStates.value[tableId]
  }

  return {
    getState,
    setState,
    resetState,
  }
})
