<template>
  <div class="cell-renderer">
    <input
      v-if="column.type === 'text'"
      class="cell-input"
      :value="localValue"
      :readonly="!editable"
      @input="onInput(($event.target as HTMLInputElement).value)"
    >

    <input
      v-else-if="column.type === 'number'"
      class="cell-input cell-input--number"
      type="number"
      :value="localValue"
      :readonly="!editable"
      @input="onInput(($event.target as HTMLInputElement).value)"
    >

    <div
      v-else-if="column.type === 'select'"
      class="cell-select"
    >
      <select
        v-if="editable"
        class="cell-select__control"
        :value="localValue"
        @change="onInput(($event.target as HTMLSelectElement).value)"
      >
        <option value="">
          —
        </option>
        <option
          v-for="opt in column.options"
          :key="opt.id"
          :value="opt.id.toString()"
        >
          {{ opt.label }}
        </option>
      </select>
      <!-- Режим просмотра: badge с цветом -->
      <span
        v-else-if="selectedOption"
        class="cell-badge"
        :style="{ backgroundColor: selectedOption.color ?? '#e2e8f0' }"
      >
        {{ selectedOption.label }}
      </span>
      <span
        v-else
        class="cell-badge cell-badge--empty"
      >—</span>

      <!-- В editable-режиме тоже показываем цветной индикатор рядом -->
      <span
        v-if="editable && selectedOption"
        class="cell-select__dot"
        :style="{ backgroundColor: selectedOption.color ?? '#e2e8f0' }"
      />
    </div>

    <label
      v-else-if="column.type === 'toggle'"
      class="cell-toggle"
    >
      <input
        type="checkbox"
        class="cell-toggle__input"
        :checked="isChecked"
        :disabled="!editable"
        @change="onInput(($event.target as HTMLInputElement).checked ? 'true' : 'false')"
      >
      <span
        class="cell-toggle__track"
        :class="{ 'cell-toggle__track--on': isChecked }"
      >
        <span class="cell-toggle__thumb" />
      </span>
    </label>

    <input
      v-else-if="column.type === 'date'"
      class="cell-input"
      type="date"
      :value="localValue"
      :readonly="!editable"
      @input="onInput(($event.target as HTMLInputElement).value)"
    >
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TableColumn } from '../../../types'

const props = defineProps<{
  column: TableColumn
  value: string | null
  editable?: boolean
}>()

const emit = defineEmits<{
  change: [value: string]
}>()

const localValue = ref(props.value ?? '')

watch(() => props.value, (v) => {
  localValue.value = v ?? ''
})

const selectedOption = computed(() => props.column.options?.find(opt => opt.id.toString() === localValue.value) ?? null,
)

const isChecked = computed(() => localValue.value === 'true')

function onInput(val: string) {
  localValue.value = val
  emit('change', val)
}
</script>

<style scoped lang="scss">
.cell-renderer {
  display: flex;
  align-items: center;
  min-height: 36px;
}

.cell-input {
  outline: none;
  border: none;
  background: transparent;
  padding: 0 0.5rem;
  width: 100%;
  color: var(--color-foreground);
  font-size: 0.875rem;

  &:focus {
    border-radius: 4px;
    background: var(--color-muted);
  }

  &--number {
    text-align: right;
  }
}

.cell-select {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0 0.25rem;
  width: 100%;

  &__control {
    flex: 1;
    cursor: pointer;
    outline: none;
    border: none;
    background: transparent;
    color: var(--color-foreground);
    font-size: 0.875rem;
  }

  &__dot {
    flex-shrink: 0;
    border-radius: 50%;
    width: 8px;
    height: 8px;
  }
}

.cell-badge {
  display: inline-block;
  border-radius: 9999px;
  padding: 2px 10px;
  color: #1a1a1a;
  font-weight: 500;
  font-size: 0.75rem;

  &--empty {
    background: var(--color-muted) !important;
    color: var(--color-muted-foreground);
  }
}

.cell-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;

  &__input {
    display: none;
  }

  &__track {
    position: relative;
    transition: background 0.2s;
    border-radius: 9999px;
    background: var(--color-muted);
    width: 36px;
    height: 20px;

    &--on {
      background: var(--color-muted-foreground);
    }
  }

  &__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
    border-radius: 50%;
    background: var(--color-foreground);
    width: 16px;
    height: 16px;

    .cell-toggle__track--on & {
      transform: translateX(16px);
    }
  }
}
</style>
