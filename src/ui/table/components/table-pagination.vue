<template>
  <div
    v-if="show"
    class="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-1.5 text-muted-foreground text-xs"
  >
    <span>{{ info }}</span>
    <div class="flex items-center gap-1">
      <ui-select
        :model-value="String(table.getState().pagination.pageSize)"
        @update:model-value="table.setPageSize(Number($event))"
      >
        <select-trigger class="h-7 w-17.5 text-xs">
          <select-value />
        </select-trigger>
        <select-content>
          <select-item
            v-for="size in pageSizes"
            :key="size"
            :value="String(size)"
          >
            {{ size }}
          </select-item>
        </select-content>
      </ui-select>
      <ui-button
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :disabled="!table.getCanPreviousPage()"
        @click="table.previousPage()"
      >
        <chevron-left-icon class="h-3.5 w-3.5" />
      </ui-button>
      <ui-button
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :disabled="!table.getCanNextPage()"
        @click="table.nextPage()"
      >
        <chevron-right-icon class="h-3.5 w-3.5" />
      </ui-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-vue-next'
import { Button as UiButton } from '@/components/ui/button'
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as UiSelect,
} from '@/components/ui/select'
import type { TableRow } from '@/types'
import type { Table } from '@tanstack/vue-table'

defineProps<{
  table: Table<TableRow>
  info: string
  pageSizes: number[]
  show: boolean
}>()
</script>
