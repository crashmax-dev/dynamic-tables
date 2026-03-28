<template>
  <div
    v-if="active"
    class="sort-notice"
  >
    <span>Таблица отсортирована. Drag & drop недоступен.</span>
    <button
      class="sort-reset"
      @click="$emit('reset')"
    >
      Сбросить
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ active: boolean }>()
defineEmits<{ reset: [] }>()
</script>

<style scoped lang="scss">
.sort-notice {
  display: flex;
  position: absolute;
  bottom: 0;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;
  border-top: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-muted) 90%, var(--color-primary) 5%);
  padding: 0.375rem 0.75rem;
  width: 100%;
  color: var(--color-muted-foreground);
  font-size: 0.78rem;

  &__reset {
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    color: var(--color-foreground);
    font-weight: 500;
    font-size: 0.78rem;
    text-decoration: underline;

    &:hover {
      opacity: 0.7;
    }
  }
}
</style>
