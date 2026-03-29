import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { computed, ref, toValue, watch } from 'vue'
import { useTableStore } from '@/stores/use-table-store'
import type { DynamicTable, TableRow } from '@/types'
import type { Updater } from '@tanstack/vue-table'
import type { MaybeRefOrGetter } from 'vue'

export function useTableCore(dynamicTable: MaybeRefOrGetter<DynamicTable>) {
  const uiStore = useTableStore()

  const table = computed(() => {
    return toValue(dynamicTable)
  })

  function getColumnIds() {
    return table.value.columns.map(c => String(c.id))
  }

  const uiState = computed(() => uiStore.getState(table.value.id, getColumnIds()))

  const localRows = ref<TableRow[]>([...table.value.rows])
  watch(() => table.value.rows, rows => {
    localRows.value = [...rows]
  })

  const localVisibility = computed<Record<string, boolean>>(() => {
    return Object.fromEntries(table.value.columns.map(c => [String(c.id), c.visible]))
  })

  const localColumnOrder = ref<string[]>(uiState.value.columnOrder)
  watch(() => table.value.columns, () => {
    const ids = getColumnIds()
    localColumnOrder.value = uiStore.getState(table.value.id, ids).columnOrder
  })

  const localSorting = ref(uiState.value.sorting)
  const localPagination = ref(uiState.value.pagination)

  const pageSizes = [10, 25, 50, 100]
  const isSortingActive = computed(() => localSorting.value.length > 0)

  function applyUpdater<T>(updater: Updater<T>, current: T): T {
    return typeof updater === 'function' ? (updater as (v: T) => T)(current) : updater
  }

  const columnDefs = computed(() => table.value.columns.map(col => ({
    id: String(col.id),
    accessorFn: (row: TableRow) => {
      const val = row.values.find(v => v.columnId === col.id)?.value ?? null
      if (col.type === 'number') return val ? Number(val) : null
      if (col.type === 'toggle') return val === 'true'
      return val ?? ''
    },
    enableSorting: true,
    size: 180,
    meta: {
      column: col,
      label: col.name,
      type: col.type,
    },
  })),
  )

  const tableCore = useVueTable({
    get data() {
      return localRows.value
    },
    get columns() {
      return columnDefs.value
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      get columnOrder() {
        return localColumnOrder.value
      },
      get columnVisibility() {
        return localVisibility.value
      },
      get sorting() {
        return localSorting.value
      },
      get pagination() {
        return localPagination.value
      },
    },
    onColumnOrderChange: updater => {
      const next = applyUpdater(updater, localColumnOrder.value)
      localColumnOrder.value = next
      uiStore.setState(table.value.id, { columnOrder: next })
    },
    onSortingChange: updater => {
      const next = applyUpdater(updater, localSorting.value)
      localSorting.value = next
      uiStore.setState(table.value.id, { sorting: next })
    },
    onPaginationChange: updater => {
      const next = applyUpdater(updater, localPagination.value)
      localPagination.value = next
      uiStore.setState(table.value.id, { pagination: next })
    },
    manualPagination: false,
  })

  const paginationInfo = computed(() => {
    const { pageIndex, pageSize } = tableCore.getState().pagination
    const total = localRows.value.length
    const from = pageIndex * pageSize + 1
    const to = Math.min((pageIndex + 1) * pageSize, total)
    return `${from}–${to} из ${total}`
  })

  function onPageSizeChange(e: Event) {
    tableCore.setPageSize(Number((e.target as HTMLSelectElement).value))
  }

  function getCellValue(row: TableRow, columnId: number) {
    return row.values.find(v => v.columnId === columnId)?.value ?? null
  }

  return {
    tableCore,
    localRows,
    localColumnOrder,
    localSorting,
    localPagination,
    isSortingActive,
    pageSizes,
    paginationInfo,
    onPageSizeChange,
    getCellValue,
  }
}
