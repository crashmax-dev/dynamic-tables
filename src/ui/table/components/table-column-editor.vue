<template>
  <div class="flex flex-col gap-4 py-2">
    <div class="flex flex-col gap-1.5">
      <ui-label for="col-name">
        Column name
      </ui-label>
      <ui-input
        id="col-name"
        v-model="name"
        placeholder="My column"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <ui-label for="col-type">
        Type
      </ui-label>
      <ui-select v-model="type">
        <select-trigger id="col-type">
          <select-value />
        </select-trigger>
        <select-content>
          <select-item
            v-for="ct in columnTypes"
            :key="ct.value"
            :value="ct.value"
          >
            {{ ct.label }}
          </select-item>
        </select-content>
      </ui-select>
    </div>

    <template v-if="type === 'select'">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <ui-label>Options</ui-label>
          <ui-button
            variant="ghost"
            size="sm"
            type="button"
            @click="addOption"
          >
            <plus-icon class="h-3.5 w-3.5" />
            Add option
          </ui-button>
        </div>
        <div
          v-for="(opt, i) in options"
          :key="i"
          class="flex items-center gap-2"
        >
          <ui-input
            v-model="opt.color"
            type="color"
            class="h-8 w-8 cursor-pointer rounded border border-border p-0.5 bg-background"
          />
          <ui-input
            v-model="opt.label"
            placeholder="Option label"
            class="flex-1"
          />
          <ui-button
            variant="ghost"
            size="icon"
            type="button"
            class="h-8 w-8 text-muted-foreground hover:text-destructive"
            @click="removeOption(i)"
          >
            <x-icon class="h-4 w-4" />
          </ui-button>
        </div>
      </div>
    </template>

    <div class="flex justify-end">
      <ui-button
        :disabled="!name.trim()"
        @click="save"
      >
        Add column
      </ui-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus as PlusIcon, X as XIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import { Button as UiButton } from '@/components/ui/button'
import { Input as UiInput } from '@/components/ui/input'
import { Label as UiLabel } from '@/components/ui/label'
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as UiSelect,
} from '@/components/ui/select'
import type { ColumnType } from '@/types'

const emit = defineEmits<{
  (event: 'save', payload: {
    name: string
    type: ColumnType
    options: { label: string, color: string }[]
  }): void
}>()

const columnTypes: { value: ColumnType, label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'toggle', label: 'Toggle' },
  { value: 'date', label: 'Date' },
]

const name = ref('')
const type = ref<ColumnType>('text')
const options = ref<{ label: string, color: string }[]>([])

function addOption() {
  options.value.push({ label: '', color: '#e2e8f0' })
}

function removeOption(i: number) {
  options.value.splice(i, 1)
}

function save() {
  if (!name.value.trim()) return
  emit('save', {
    name: name.value,
    type: type.value,
    options: options.value,
  })
}
</script>
