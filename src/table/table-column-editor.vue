<template>
  <div class="col-editor">
    <label class="field">
      <span class="field__label">Название</span>
      <input
        v-model="name"
        class="field__input"
        placeholder="Например: Оценка"
      >
    </label>

    <label class="field">
      <span class="field__label">Тип</span>
      <select
        v-model="type"
        class="field__select"
      >
        <option
          v-for="t in columnTypes"
          :key="t.value"
          :value="t.value"
        >
          {{ t.label }}
        </option>
      </select>
    </label>

    <div
      v-if="type === 'select'"
      class="col-editor__options"
    >
      <div class="col-editor__options-header">
        <span class="field__label">Варианты</span>
        <button
          class="btn btn--outline"
          type="button"
          @click="addOption"
        >
          + Добавить
        </button>
      </div>
      <div
        v-for="(opt, i) in options"
        :key="i"
        class="col-editor__option-row"
      >
        <input
          v-model="opt.color"
          type="color"
          class="col-editor__color"
        >
        <input
          v-model="opt.label"
          class="field__input"
          placeholder="Плохо / Пойдет / Круто"
        >
        <button
          class="col-editor__remove"
          type="button"
          @click="removeOption(i)"
        >
          ✕
        </button>
      </div>
    </div>

    <button
      class="btn btn--primary"
      @click="save"
    >
      Сохранить
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ColumnType } from '../types'

const emit = defineEmits<{
  save: [payload: {
    name: string
    type: ColumnType
    options: typeof options.value
  }]
}>()

const columnTypes: { value: ColumnType, label: string }[] = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'select', label: 'Селектор' },
  { value: 'toggle', label: 'Переключатель' },
  { value: 'date', label: 'Дата' },
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

<style scoped lang="scss">
.col-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__options-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  &__option-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.375rem;
  }

  &__color {
    cursor: pointer;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 2px;
    width: 32px;
    height: 32px;
  }

  &__remove {
    cursor: pointer;
    border: none;
    background: none;
    padding: 0 0.25rem;
    color: var(--color-muted-foreground);
    font-size: 0.875rem;

    &:hover {
      color: #ef4444;
    }
  }
}
</style>
