<template>
  <dialog-root
    open
    @update:open="!$event && emit('close')"
  >
    <dialog-content class="sm:max-w-120">
      <dialog-header>
        <dialog-title>Add column</dialog-title>
      </dialog-header>
      <table-column-editor @save="onSave" />
    </dialog-content>
  </dialog-root>
</template>

<script setup lang="ts">
import {
  DialogContent,
  DialogHeader,
  Dialog as DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ColumnType } from '@/types'
import TableColumnEditor from '@/ui/table/components/table-column-editor.vue'

const props = defineProps<{
  onAdd: (payload: {
    name: string
    type: ColumnType
    options: { label: string, color: string }[]
  }) => Promise<void>
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

async function onSave(payload: {
  name: string
  type: ColumnType
  options: { label: string, color: string }[]
}) {
  await props.onAdd(payload)
  emit('close')
}
</script>
