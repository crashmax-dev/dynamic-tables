<template>
  <thead>
    <tr>
      <th class="dt__th dt__th--drag" />
      <th
        v-for="header in headers"
        :key="header.id"
        class="dt__th"
        :style="{ width: `${header.getSize()}px` }"
        @click="header.column.getCanSort() && header.column.toggleSorting()"
        @contextmenu.prevent="$emit('context-menu', $event, header.column.id)"
      >
        <div class="dt__th-inner">
          <div class="dt__th-top">
            <span class="dt__col-name">
              {{ header.column.columnDef.meta?.label }}
            </span>
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
</template>

<script setup lang="ts">
import type { Header } from '@tanstack/vue-table'
import type { TableRow } from '../../../types'

defineProps<{
  headers: Header<TableRow, unknown>[]
}>()

defineEmits<{
  'context-menu': [event: MouseEvent, columnId: string]
}>()
</script>

<style scoped lang="scss">
.dt__th {
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-card);
  padding: 0;
  font-weight: 500;
  user-select: none;
  text-align: left;
  white-space: nowrap;

  &--drag {
    width: 28px;
    min-width: 28px;
  }

  &--actions {
    width: 40px;
    min-width: 40px;
  }

  &:hover {
    cursor: pointer;
    background: var(--color-muted);
  }
}

.dt__th-inner {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.375rem 0.5rem;
}

.dt__th-top {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dt__col-name {
  overflow: hidden;
  color: var(--color-foreground);
  font-size: 0.875rem;
  text-overflow: ellipsis;
}

.dt__col-type {
  color: var(--color-muted-foreground);
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.dt__sort-icon {
  color: var(--color-muted-foreground);
  font-size: 0.75rem;
}
</style>
