<template>
  <tr
    class="group border-b transition-colors hover:bg-muted/50"
    :class="{ 'opacity-50 bg-muted': isDragging }"
    :draggable="draggable"
    @dragstart="draggable && emit('drag-start', row.original.id)"
    @dragover.prevent="draggable && emit('drag-over', row.original.id)"
    @dragend="draggable && emit('drag-end')"
  >
    <td class="w-7 min-w-7 p-0 text-center">
      <span
        class="inline-block px-1.5 text-muted-foreground text-base transition-opacity"
        :class="draggable ? 'opacity-0 group-hover:opacity-100 cursor-grab' : 'invisible'"
      >
        ⠿
      </span>
    </td>
    <td
      v-for="cell in row.getVisibleCells()"
      :key="cell.id"
      class="p-0 border-none"
    >
      <table-cell-renderer
        :column="cell.column.columnDef.meta!.column"
        :value="getCellValue(row.original, cell.column.columnDef.meta!.column.id)"
        editable
        @change="emit('cell-change', row.original.id, cell.column.columnDef.meta!.column.id, $event)"
      />
    </td>
    <td class="w-10 min-w-10 p-0 text-center">
      <button
        class="inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded p-1 border-none bg-transparent text-muted-foreground hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
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
</template>

<script setup lang="ts">
import type { TableRow } from '@/types'
import TableCellRenderer from './table-cell-renderer.vue'
import type { Row } from '@tanstack/vue-table'

defineProps<{
  row: Row<TableRow>
  isDragging: boolean
  draggable: boolean
  getCellValue: (row: TableRow, columnId: number) => string | null
}>()

const emit = defineEmits<{
  (event: 'cell-change', rowId: number, columnId: number, value: string): void
  (event: 'delete-row', rowId: number): void
  (event: 'drag-start', rowId: number): void
  (event: 'drag-over', rowId: number): void
  (event: 'drag-end'): void
}>()
</script>
