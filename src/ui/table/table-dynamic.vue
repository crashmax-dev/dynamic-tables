<template>
  <div class="relative flex flex-1 flex-col min-w-0 overflow-hidden border rounded-lg bg-card mx-6 mb-6 mt-4">
    <div
      v-if="loading"
      class="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-card/80 text-muted-foreground text-sm"
    >
      <loader2-icon class="h-4 w-4 animate-spin" />
      Loading…
    </div>

    <table-pagination
      :table="tableCore"
      :info="paginationInfo"
      :page-sizes="pageSizes"
      :show="!!paginated && table.rows.length > 0"
      @page-size-change="onPageSizeChange"
    />

    <div
      ref="scrollRef"
      class="flex-1 overflow-auto min-w-0"
    >
      <table class="w-full border-collapse table-fixed">
        <table-header
          :headers="tableCore.getFlatHeaders()"
          @context-menu="onHeaderContextMenu"
        />
        <tbody
          v-if="virtual"
          :style="{ height: `${rowVirtualizer?.getTotalSize()}px`, position: 'relative' }"
        >
          <table-row
            v-for="vRow in virtualRows"
            :key="String(vRow.key)"
            :row="tableCore.getRowModel().rows[vRow.index]"
            :is-dragging="dragRowId === tableRows[vRow.index]?.id"
            :draggable="!isSortingActive"
            :get-cell-value="getCellValue"
            :style="{ position: 'absolute', top: 0, transform: `translateY(${vRow.start}px)`, width: '100%' }"
            @cell-change="(rowId, colId, val) => emit('cell-change', rowId, colId, val)"
            @delete-row="(rowId) => emit('delete-row', rowId)"
            @drag-start="onDragStart(tableRows[vRow.index].id)"
            @drag-over="onDragOver(tableRows[vRow.index].id)"
            @drag-end="onDragEnd"
          />
        </tbody>
        <tbody v-else>
          <table-row
            v-for="row in tableCore.getRowModel().rows"
            :key="row.id"
            :row="row"
            :is-dragging="dragRowId === row.original.id"
            :draggable="!isSortingActive"
            :get-cell-value="getCellValue"
            @cell-change="(rowId, colId, val) => emit('cell-change', rowId, colId, val)"
            @delete-row="(rowId) => emit('delete-row', rowId)"
            @drag-start="onDragStart(row.original.id)"
            @drag-over="onDragOver(row.original.id)"
            @drag-end="onDragEnd"
          />
          <tr v-if="!table.rows.length">
            <td
              :colspan="tableCore.getFlatHeaders().length + 2"
              class="p-8 text-center text-muted-foreground text-sm"
            >
              No rows yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <table-sort-notice
      :active="isSortingActive"
      @reset="tableCore.resetSorting()"
    />

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
import { Loader2 as Loader2Icon } from 'lucide-vue-next'
import { computed, useTemplateRef } from 'vue'
import type { GetApiTablesByIdResponses } from '@/api'
import TableHeaderContextMenu from './components/table-header-context-menu.vue'
import TableHeader from './components/table-header.vue'
import TablePagination from './components/table-pagination.vue'
import TableRow from './components/table-row.vue'
import TableSortNotice from './components/table-sort-notice.vue'
import { useTableColumns } from './composables/use-table-columns'
import { useTableCore } from './composables/use-table-core'
import { useTableDrag } from './composables/use-table-drag'
import { useTableVirtualizer } from './composables/use-table-virtualizer'

const props = defineProps<{
  table: GetApiTablesByIdResponses['200']
  virtual?: boolean
  loading?: boolean
  paginated?: boolean
}>()

const emit = defineEmits<{
  (event: 'cell-change', rowId: number, columnId: number, value: string): void
  (event: 'delete-row', rowId: number): void
}>()

const scrollRef = useTemplateRef<HTMLElement>('scrollRef')

const {
  tableCore,
  localRows,
  localColumnOrder,
  isSortingActive,
  pageSizes,
  paginationInfo,
  onPageSizeChange,
  getCellValue,
} = useTableCore(() => props.table)

const tableId = computed(() => props.table.id)

const {
  dragRowId,
  onDragStart,
  onDragOver,
  onDragEnd,
} = useTableDrag(localRows, tableId)

const virtualFlag = computed(() => props.virtual)
const {
  rowVirtualizer,
  virtualRows,
} = useTableVirtualizer(scrollRef, localRows, virtualFlag)
const tableRows = computed(() => {
  return tableCore.getRowModel().rows.map((row) => row.original)
})

const {
  ctxMenu,
  ctxMenuColumns,
  onHeaderContextMenu,
  onToggleVisibility,
  onMoveColumn,
} = useTableColumns(props.table, tableCore, localColumnOrder)
</script>
