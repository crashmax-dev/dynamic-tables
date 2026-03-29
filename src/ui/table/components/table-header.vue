<template>
  <thead>
    <tr>
      <th class="sticky top-0 z-10 w-7 min-w-7 border-b bg-card p-0" />
      <th
        v-for="header in headers"
        :key="header.id"
        class="sticky top-0 z-10 border-b bg-card p-0 text-left whitespace-nowrap select-none"
        :class="header.column.getCanSort() ? 'cursor-pointer hover:bg-muted' : ''"
        :style="{ width: `${header.getSize()}px` }"
        @click="header.column.getCanSort() && header.column.toggleSorting()"
        @contextmenu.prevent="emit('context-menu', $event, header.column.id)"
      >
        <div class="flex flex-col gap-0.5 px-2 py-1.5">
          <div class="flex items-center gap-1">
            <span class="overflow-hidden text-foreground text-sm text-ellipsis font-medium">
              {{ header.column.columnDef.meta?.label }}
            </span>
            <span
              v-if="header.column.getIsSorted()"
              class="text-muted-foreground text-xs shrink-0"
            >
              {{ header.column.getIsSorted() === 'asc' ? '↑' : '↓' }}
            </span>
          </div>
          <span class="text-muted-foreground text-[0.68rem] uppercase tracking-wide">
            {{ header.column.columnDef.meta?.type }}
          </span>
        </div>
      </th>
      <th class="sticky top-0 z-10 w-10 min-w-10 border-b bg-card p-0" />
    </tr>
  </thead>
</template>

<script setup lang="ts">
import type { TableRow } from '@/types'
import type { Header } from '@tanstack/vue-table'

defineProps<{
  headers: Header<TableRow, unknown>[]
}>()

const emit = defineEmits<{
  (event: 'context-menu', mouseEvent: MouseEvent, columnId: string): void
}>()
</script>
