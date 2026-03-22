<template>
  <div class="dynamic-table">
    <div
      v-if="loading"
      class="dynamic-table__loading"
    />

    <div
      v-if="isSortingActive"
      class="dynamic-table__sort-notice"
    >
      Сортировка активна — перетаскивание строк недоступно.
      <button
        class="dynamic-table__sort-reset"
        @click="tanTable.resetSorting()"
      >
        Сбросить
      </button>
    </div>

    <div
      v-if="paginated && table.rows.length > 0"
      class="dynamic-table__pagination"
    >
      <span class="dt-pagination__info">{{ paginationInfo }}</span>
      <div class="dt-pagination__controls">
        <select
          class="dt-pagination__size"
          :value="tanTable.getState().pagination.pageSize"
          @change="onPageSizeChange"
        >
          <option
            v-for="size in pageSizes"
            :key="size"
            :value="size"
          >
            {{ size }} / стр
          </option>
        </select>
        <button
          class="btn btn--ghost btn--icon"
          :disabled="!tanTable.getCanPreviousPage()"
          @click="tanTable.previousPage()"
        >
          ‹
        </button>
        <button
          class="btn btn--ghost btn--icon"
          :disabled="!tanTable.getCanNextPage()"
          @click="tanTable.nextPage()"
        >
          ›
        </button>
      </div>
    </div>

    <div
      ref="scrollRef"
      class="dynamic-table__scroll"
    >
      <table class="dt">
        <thead>
          <tr>
            <th class="dt__th dt__th--drag" />
            <th
              v-for="header in tanTable.getFlatHeaders()"
              :key="header.id"
              class="dt__th"
              :style="{ width: `${header.getSize()}px` }"
              @click="header.column.getCanSort() && header.column.toggleSorting()"
              @contextmenu.prevent="onHeaderContextMenu($event, header.column.id)"
            >
              <div class="dt__th-inner">
                <div class="dt__th-top">
                  <span class="dt__col-name">{{ header.column.columnDef.meta?.label }}</span>
                  <span
                    v-if="header.column.getIsSorted()"
                    class="dt__sort-icon"
                  >
                    {{ header.column.getIsSorted() === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
                <span class="dt__col-type">{{ header.column.columnDef.meta?.type }}</span>
              </div>
            </th>

            <th class="dt__th dt__th--actions" />
          </tr>
        </thead>

        <!-- Виртуализация -->
        <tbody
          v-if="virtual"
          :style="{ height: `${rowVirtualizer?.getTotalSize()}px`, position: 'relative' }"
        >
          <tr
            v-for="vRow in virtualRows"
            :key="String(vRow.key)"
            class="dt__row"
            :class="{
              'dt__row--dragging': dragRowId === tableRows[vRow.index]?.id,
              'dt__row--no-drag': isSortingActive,
            }"
            :style="{
              position: 'absolute',
              top: 0,
              transform: `translateY(${vRow.start}px)`,
              width: '100%',
            }"
            :draggable="!isSortingActive"
            @dragstart="!isSortingActive && onDragStart(tableRows[vRow.index]?.id)"
            @dragover.prevent="!isSortingActive && onDragOver(tableRows[vRow.index]?.id)"
            @dragend="!isSortingActive && onDragEnd()"
          >
            <td class="dt__td dt__td--drag">
              <span class="dt__drag-handle">⠿</span>
            </td>
            <td
              v-for="cell in tanTable.getRowModel().rows[vRow.index]?.getVisibleCells()"
              :key="cell.id"
              class="dt__td"
            >
              <table-cell-renderer
                :column="cell.column.columnDef.meta!.column"
                :value="getCellValue(tableRows[vRow.index], cell.column.columnDef.meta!.column.id)"
                editable
                @change="emit('cell-change', tableRows[vRow.index].id, cell.column.columnDef.meta!.column.id, $event)"
              />
            </td>
            <td class="dt__td dt__td--actions">
              <button
                class="dt__row-delete"
                @click="emit('delete-row', tableRows[vRow.index].id)"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>

        <!-- Обычный рендер -->
        <tbody v-else>
          <tr
            v-for="row in tanTable.getRowModel().rows"
            :key="row.id"
            class="dt__row"
            :class="{
              'dt__row--dragging': dragRowId === row.original.id,
              'dt__row--no-drag': isSortingActive,
            }"
            :draggable="!isSortingActive"
            @dragstart="!isSortingActive && onDragStart(row.original.id)"
            @dragover.prevent="!isSortingActive && onDragOver(row.original.id)"
            @dragend="!isSortingActive && onDragEnd()"
          >
            <td class="dt__td dt__td--drag">
              <span class="dt__drag-handle">⠿</span>
            </td>
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="dt__td"
            >
              <table-cell-renderer
                :column="cell.column.columnDef.meta!.column"
                :value="getCellValue(row.original, cell.column.columnDef.meta!.column.id)"
                editable
                @change="emit('cell-change', row.original.id, cell.column.columnDef.meta!.column.id, $event)"
              />
            </td>
            <td class="dt__td dt__td--actions">
              <button
                class="dt__row-delete"
                @click="emit('delete-row', row.original.id)"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
            </td>
          </tr>

          <tr v-if="!table.rows.length">
            <td
              :colspan="tanTable.getFlatHeaders().length + 2"
              class="dt__empty"
            >
              Нет данных
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <table-header-context-menu
      :visible="ctxMenu.visible"
      :x="ctxMenu.x"
      :y="ctxMenu.y"
      :columns="ctxMenuColumns"
      :target-column-id="ctxMenu.columnId"
      @close="ctxMenu.visible = false"
      @toggle-visibility="onToggleVisibility"
      @move-left="onMoveColumn($event, -1)"
      @move-right="onMoveColumn($event, 1)"
    />
  </div>
</template>

<script setup lang="ts">
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, reactive, ref, watch } from 'vue'
import {
  useReorderColumns,
  useReorderRows,
  useUpdateColumn,
} from '../queries/tables'
import { useTableStore } from '../stores/use-table-store'
import TableCellRenderer from './table-cell-renderer.vue'
import TableHeaderContextMenu from './table-header-context-menu.vue'
import type { DynamicTable, TableRow } from '../types'

const props = withDefaults(defineProps<{
  table: DynamicTable
  virtual?: boolean
  loading?: boolean
  paginated?: boolean
}>(), {
  virtual: false,
  paginated: true,
})

const emit = defineEmits<{
  'cell-change': [rowId: number, columnId: number, value: string]
  'delete-row': [rowId: number]
  'rows-reorder': [orderedIds: number[]]
}>()

const { mutate: updateColumn } = useUpdateColumn()
const { mutate: reorderColumns } = useReorderColumns()
const { mutate: reorderRows } = useReorderRows()

const uiStore = useTableStore()

function getColumnIds() {
  return props.table.columns.map(c => String(c.id))
}

const uiState = computed(() => uiStore.getState(props.table.id, getColumnIds()))

const localRows = ref<TableRow[]>([...props.table.rows])
watch(() => props.table.rows, rows => {
  localRows.value = [...rows]
})

const localVisibility = computed<Record<string, boolean>>(() => Object.fromEntries(props.table.columns.map(c => [String(c.id), c.visible])),
)

const localColumnOrder = ref<string[]>(uiState.value.columnOrder)
watch(() => props.table.columns, () => {
  const ids = getColumnIds()
  localColumnOrder.value = uiStore.getState(props.table.id, ids).columnOrder
})

const localSorting = ref(uiState.value.sorting)
const localPagination = ref(uiState.value.pagination)

const pageSizes = [10, 25, 50, 100]

const isSortingActive = computed(() => localSorting.value.length > 0)

const columnDefs = computed(() => props.table.columns.map(col => ({
  id: String(col.id),
  accessorFn: (row: TableRow) => {
    const val = row.values.find(v => v.columnId === col.id)?.value ?? null
    if (col.type === 'number') return val ? Number(val) : null
    if (col.type === 'toggle') return val === 'true'
    return val ?? ''
  },
  enableSorting: true,
  size: 180,
  meta: { column: col, label: col.name, type: col.type },
})),
)

const tanTable = useVueTable({
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
  onColumnOrderChange: (updater) => {
    const next = typeof updater === 'function' ? updater(localColumnOrder.value) : updater
    localColumnOrder.value = next
    uiStore.setState(props.table.id, { columnOrder: next })
  },
  onSortingChange: (updater) => {
    const next = typeof updater === 'function' ? updater(localSorting.value) : updater
    localSorting.value = next
    uiStore.setState(props.table.id, { sorting: next })
  },
  onPaginationChange: (updater) => {
    const next = typeof updater === 'function' ? updater(localPagination.value) : updater
    localPagination.value = next
    uiStore.setState(props.table.id, { pagination: next })
  },
  manualPagination: false,
})

const paginationInfo = computed(() => {
  const { pageIndex, pageSize } = tanTable.getState().pagination
  const total = localRows.value.length
  const from = pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)
  return `${from}–${to} из ${total}`
})

function onPageSizeChange(e: Event) {
  tanTable.setPageSize(Number((e.target as HTMLSelectElement).value))
}

const scrollRef = ref<HTMLElement | null>(null)
const tableRows = computed(() => tanTable.getRowModel().rows.map(r => r.original))

const rowVirtualizer = computed(() => {
  if (!props.virtual) return null
  const virtualizer = useVirtualizer({
    count: tableRows.value.length,
    getScrollElement: () => scrollRef.value,
    estimateSize: () => 44,
    overscan: 10,
  })
  return virtualizer.value
})

const virtualRows = computed(() => rowVirtualizer.value?.getVirtualItems() ?? [])

function getCellValue(row: TableRow, columnId: number) {
  return row.values.find(v => v.columnId === columnId)?.value ?? null
}

const dragRowId = ref<number | null>(null)

function onDragStart(rowId: number) {
  dragRowId.value = rowId
}

function onDragOver(rowId: number) {
  if (dragRowId.value === null || dragRowId.value === rowId) return
  const rows = [...localRows.value]
  const fromIdx = rows.findIndex(r => r.id === dragRowId.value)
  const toIdx = rows.findIndex(r => r.id === rowId)
  if (fromIdx === -1 || toIdx === -1) return
  const [moved] = rows.splice(fromIdx, 1)
  rows.splice(toIdx, 0, moved)
  localRows.value = rows
}

function onDragEnd() {
  dragRowId.value = null
  const orderedIds = localRows.value.map(r => r.id)
  emit('rows-reorder', orderedIds)
  reorderRows({ tableId: props.table.id, orderedIds })
}

const ctxMenu = reactive({ visible: false, x: 0, y: 0, columnId: '' })

const ctxMenuColumns = computed(() => localColumnOrder.value
  .map(id => props.table.columns.find(c => String(c.id) === id))
  .filter(Boolean)
  .map(col => ({
    id: String(col!.id),
    name: col!.name,
    visible: col!.visible,
  })),
)

function onHeaderContextMenu(e: MouseEvent, columnId: string) {
  ctxMenu.x = e.clientX
  ctxMenu.y = e.clientY
  ctxMenu.columnId = columnId
  ctxMenu.visible = true
}

function onToggleVisibility(columnId: string) {
  const col = props.table.columns.find(c => String(c.id) === columnId)
  if (!col) return
  updateColumn({
    id: col.id,
    tableId: props.table.id,
    data: { visible: !col.visible },
  })
  ctxMenu.visible = false
}

function onMoveColumn(columnId: string, direction: -1 | 1) {
  const order = [...localColumnOrder.value]
  const currentIdx = order.indexOf(columnId)
  if (currentIdx === -1) return

  let targetIdx = -1
  let i = currentIdx + direction
  while (i >= 0 && i < order.length) {
    const isVisible = props.table.columns
      .find(c => String(c.id) === order[i])
      ?.visible
    if (isVisible) {
      targetIdx = i
      break
    }
    i += direction
  }

  if (targetIdx === -1) return;
  [order[currentIdx], order[targetIdx]] = [order[targetIdx], order[currentIdx]]
  tanTable.setColumnOrder(order)
  reorderColumns({
    tableId: props.table.id,
    orderedIds: order.map(Number),
  })
  ctxMenu.visible = false
}
</script>

<style scoped lang="scss">
.dynamic-table {
  display: flex;
  position: relative;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-card);
  overflow: hidden;

  &__scroll {
    flex: 1;
    overflow: auto;
  }

  &__pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid var(--color-border);
    padding: 0.5rem 0.75rem;
    color: var(--color-muted-foreground);
    font-size: 0.8rem;
  }

  &__sort-notice {
    display: flex;
    position: absolute;
    bottom: 0;
    align-items: center;
    gap: 0.5rem;
    z-index: 1;
    border-bottom: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-muted) 90%, var(--color-primary) 5%);
    padding: 0.375rem 0.75rem;
    width: 100%;
    color: var(--color-muted-foreground);
    font-size: 0.78rem;
  }

  &__sort-reset {
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    color: var(--color-foreground);
    font-weight: 500;
    font-size: 0.78rem;
    text-decoration: underline;

    &:hover {
      opacity: 0.7;
    }
  }

  &__loading {
    position: absolute;
    top: 0;
    animation: progress-slide 2s ease-in-out infinite;
    background-color: var(--color-primary);
    height: 2px;
  }

  @keyframes progress-slide {
    0% {
      left: 0;
      width: 0;
    }
    50% {
      left: 0;
      width: 100%;
    }
    100% {
      left: 100%;
      width: 0;
    }
  }
}

.dt-pagination {
  &__controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__size {
    cursor: pointer;
    outline: none;
    border: 1px solid var(--color-border);
    border-radius: calc(var(--radius) - 2px);
    background: var(--color-background);
    padding: 0.2rem 0.4rem;
    color: var(--color-foreground);
    font-size: 0.8rem;
  }
}

.dt {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
  font-size: 0.875rem;

  thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background: color-mix(in srgb, var(--color-muted) 90%, var(--color-primary) 5%);
  }

  &__th {
    transition: background 0.15s;
    cursor: pointer;
    border-bottom: 1px solid var(--color-border);
    padding: 0.5rem 0.75rem;
    font-weight: 500;
    user-select: none;
    text-align: left;
    white-space: nowrap;

    &:hover {
      background: color-mix(in srgb, var(--color-muted) 80%, var(--color-border));
    }

    &--drag,
    &--actions {
      cursor: default;
      padding: 0;
      width: 36px;

      &:hover {
        background: var(--color-muted);
      }
    }
  }

  &__th-inner {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__th-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.25rem;
  }

  &__col-name {
    overflow: hidden;
    color: var(--color-foreground);
    font-size: 0.8rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__col-type {
    display: block;
    color: var(--color-muted-foreground);
    font-size: 0.65rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  &__sort-icon {
    flex-shrink: 0;
    color: var(--color-muted-foreground);
    font-size: 0.75rem;
  }

  &__col-name {
    display: block;
    color: var(--color-foreground);
    font-size: 0.8rem;
  }

  &__col-type {
    display: block;
    color: var(--color-muted-foreground);
    font-size: 0.65rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  &__sort-icon {
    margin-left: 0.25rem;
    font-size: 0.75rem;
  }

  &__row {
    transition: background 0.1s;
    border-bottom: 1px solid var(--color-border);

    &:hover {
      background: var(--color-muted);

      .dt__row-delete,
      .dt__drag-handle {
        opacity: 1;
      }
    }

    &--dragging {
      opacity: 0.5;
    }
  }

  &__td {
    vertical-align: middle;
    padding: 0.125rem 0.375rem;

    &--drag,
    &--actions {
      padding: 0 0.25rem;
      width: 36px;
    }

    &__row--no-drag {
      .dt__drag-handle {
        display: none;
      }
    }
  }

  &__drag-handle {
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.15s;
    cursor: grab;
    height: 36px;
    color: var(--color-muted-foreground);
    font-size: 1.1rem;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }

  &__row-delete {
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition:
      color 0.15s,
      background 0.15s,
      opacity 0.15s;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background: none;
    padding: 4px;
    color: var(--color-muted-foreground);

    &:hover {
      background: rgb(239 68 68 / 10%);
      color: #ef4444;
    }
  }

  &__empty {
    padding: 2rem;
    color: var(--color-muted-foreground);
    text-align: center;
  }
}

.btn--ghost {
  border: 1px solid var(--color-border);
  background: none;
  padding: 0.25rem 0.5rem;
  color: var(--color-foreground);

  &:hover:not(:disabled) {
    background: var(--color-muted);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.btn--icon {
  justify-content: center;
  padding: 0.3rem 0.5rem;
  min-width: 32px;
}
</style>
