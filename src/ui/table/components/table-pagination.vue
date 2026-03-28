<template>
  <div
    v-if="show"
    class="dt-pagination"
  >
    <span class="dt-pagination__info">{{ info }}</span>
    <div class="dt-pagination__controls">
      <select
        class="dt-pagination__size"
        :value="table.getState().pagination.pageSize"
        @change="$emit('page-size-change', $event)"
      >
        <option
          v-for="size in pageSizes"
          :key="size"
          :value="size"
        >
          {{ size }}
        </option>
      </select>
      <button
        class="btn btn--ghost btn--icon"
        :disabled="!table.getCanPreviousPage()"
        @click="table.previousPage()"
      >
        ‹
      </button>
      <button
        class="btn btn--ghost btn--icon"
        :disabled="!table.getCanNextPage()"
        @click="table.nextPage()"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableRow } from '@/types'
import type { Table } from '@tanstack/vue-table'

defineProps<{
  table: Table<TableRow>
  info: string
  pageSizes: number[]
  show: boolean
}>()

defineEmits<{
  'page-size-change': [e: Event]
}>()
</script>

<style scoped lang="scss">
.dt-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  padding: 0.5rem 0.75rem;
  color: var(--color-muted-foreground);
  font-size: 0.8rem;

  &__controls {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  &__size {
    cursor: pointer;
    outline: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-background);
    padding: 0.25rem 0.5rem;
    color: var(--color-foreground);
    font-size: 0.8rem;
  }

  &__btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    line-height: 1;
  }
}
</style>
