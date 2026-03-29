<template>
  <dialog-root
    open
    @update:open="!$event && emit('close')"
  >
    <dialog-content class="sm:max-w-100">
      <dialog-header>
        <dialog-title>New table</dialog-title>
      </dialog-header>
      <div class="flex flex-col gap-1.5 py-2">
        <ui-label for="table-name">
          Table name
        </ui-label>
        <ui-input
          id="table-name"
          ref="inputRef"
          v-model="name"
          placeholder="My table"
          @keydown.enter="submit"
        />
      </div>
      <dialog-footer>
        <ui-button
          variant="outline"
          @click="emit('close')"
        >
          Cancel
        </ui-button>
        <ui-button
          :disabled="loading"
          @click="submit"
        >
          {{ loading ? 'Creating…' : 'Create' }}
        </ui-button>
      </dialog-footer>
    </dialog-content>
  </dialog-root>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from 'vue'
import { Button as UiButton } from '@/components/ui/button'
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  Dialog as DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input as UiInput } from '@/components/ui/input'
import { Label as UiLabel } from '@/components/ui/label'

const props = defineProps<{
  onCreated: (name: string) => Promise<void>
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const name = ref('')
const loading = ref(false)
const inputRef = useTemplateRef('inputRef')

onMounted(async () => {
  await nextTick()
  inputRef.value?.$el?.focus()
})

async function submit() {
  if (!name.value.trim() || loading.value) return
  loading.value = true
  try {
    await props.onCreated(name.value.trim())
    emit('close')
  } finally {
    loading.value = false
  }
}
</script>
