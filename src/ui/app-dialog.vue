<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="modelValue"
        class="dialog-overlay"
        @click.self="emit('update:modelValue', false)"
      >
        <div
          class="dialog"
          :style="{ width }"
        >
          <div class="dialog__header">
            <h2 class="dialog__title">
              {{ title }}
            </h2>
            <button
              class="dialog__close"
              @click="emit('update:modelValue', false)"
            >
              ✕
            </button>
          </div>
          <div class="dialog__body">
            <slot />
          </div>
          <div
            v-if="$slots.footer"
            class="dialog__footer"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  width?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped lang="scss">
.dialog-overlay {
  display: flex;
  position: fixed;
  justify-content: center;
  align-items: center;
  z-index: 200;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  padding: 1rem;
}

.dialog {
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgb(0 0 0 / 12%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-card);
  width: 420px;
  max-width: 100%;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.25rem 0;
  }

  &__title {
    margin: 0;
    font-weight: 600;
    font-size: 1rem;
  }

  &__close {
    transition:
      color 0.15s,
      background 0.15s;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background: none;
    padding: 0.25rem;
    color: var(--color-muted-foreground);
    font-size: 0.875rem;
    line-height: 1;

    &:hover {
      background: var(--color-muted);
      color: var(--color-foreground);
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0 1.25rem 1.25rem;
  }
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.15s;

  .dialog {
    transition:
      transform 0.15s,
      opacity 0.15s;
  }
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;

  .dialog {
    transform: translateY(8px);
    opacity: 0;
  }
}
</style>
