<template>
  <dialog-root
    open
    @update:open="!$event && emit('close')"
  >
    <dialog-content class="sm:max-w-100">
      <dialog-header>
        <dialog-title>
          Delete {{ type === 'table' ? 'table' : 'row' }}
        </dialog-title>
        <dialog-description>
          <template v-if="type === 'table'">
            Are you sure you want to delete <strong>{{ name }}</strong>?
            This action cannot be undone.
          </template>
          <template v-else>
            Are you sure you want to delete this row? This action cannot be undone.
          </template>
        </dialog-description>
      </dialog-header>
      <dialog-footer>
        <ui-button
          variant="outline"
          @click="emit('close')"
        >
          Cancel
        </ui-button>
        <ui-button
          variant="destructive"
          :disabled="loading"
          @click="submit"
        >
          {{ loading ? 'Deleting…' : 'Delete' }}
        </ui-button>
      </dialog-footer>
    </dialog-content>
  </dialog-root>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button as UiButton } from '@/components/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  Dialog as DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps<{
  type: 'table' | 'row'
  name?: string
  onConfirm: () => Promise<void>
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    await props.onConfirm()
    emit('close')
  } finally {
    loading.value = false
  }
}
</script>
