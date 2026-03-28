<template>
  <tr
    class="dt__row"
    :class="{
      'dt__row--dragging': isDragging,
      'dt__row--no-drag': !draggable,
    }"
    :draggable="draggable"
    @dragstart="draggable && $emit('drag-start', row.original.id)"
    @dragover.prevent="draggable && $emit('drag-over', row.original.id)"
    @dragend="draggable && $emit('drag-end')"
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
        @change="$emit('cell-change', row.original.id, cell.column.columnDef.meta!.column.id, $event)"
      />
    </td>
    <td class="dt__td dt__td--actions">
      <button
        class="dt__row-delete"
        @click="$emit('delete-row', row.original.id)"
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
import TableCellRenderer from './table-cell-renderer.vue'
import type { Row } from '@tanstack/vue-table'
import type { TableRow } from '../../../types'

defineProps<{
  row: Row<TableRow>
  isDragging: boolean
  draggable: boolean
  getCellValue: (row: TableRow, columnId: number) => string | null
}>()

defineEmits<{
  (event: 'cell-change', rowId: number, columnId: number, value: string): void
  (event: 'delete-row', rowId: number): void
  (event: 'drag-start', rowId: number): void
  (event: 'drag-over', rowId: number): void
  (event: 'drag-end'): void
}>()
</script>

<style scoped lang="scss">
.dt__row {
  transition: background 0.1s;
  border-bottom: 1px solid var(--color-border);

  &:hover {
    background: var(--color-muted);

    .dt__row-delete {
      opacity: 1;
    }
  }

  &--dragging {
    opacity: 0.5;
    background: var(--color-muted);
  }

  &--no-drag .dt__drag-handle {
    opacity: 0;
    cursor: default;
  }
}

.dt__td {
  border: none;
  padding: 0;

  &--drag {
    width: 28px;
    min-width: 28px;
    text-align: center;
  }

  &--actions {
    width: 40px;
    min-width: 40px;
    text-align: center;
  }
}

.dt__drag-handle {
  display: inline-block;
  opacity: 0;
  transition: opacity 0.15s;
  cursor: grab;
  padding: 0 0.375rem;
  color: var(--color-muted-foreground);
  font-size: 1rem;

  .dt__row:hover & {
    opacity: 1;
  }
}

.dt__row-delete {
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
</style>
