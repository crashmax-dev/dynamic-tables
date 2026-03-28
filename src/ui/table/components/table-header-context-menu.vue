<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="col-ctx-menu"
      :style="{ top: `${y}px`, left: `${x}px` }"
      @contextmenu.prevent
    >
      <div class="col-ctx-menu__section-title">
        Столбцы
      </div>

      <div
        v-for="col in columns"
        :key="col.id"
        class="col-ctx-menu__item col-ctx-menu__item--check"
        @click="emit('toggle-visibility', col.id)"
      >
        <span class="col-ctx-menu__check">
          <svg
            v-if="col.visible"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        {{ col.name }}
      </div>

      <div class="col-ctx-menu__divider" />

      <div class="col-ctx-menu__section-title">
        Переместить «{{ targetColumnName }}»
      </div>

      <div
        class="col-ctx-menu__item"
        :class="{ 'col-ctx-menu__item--disabled': isFirst }"
        @click="!isFirst && emit('move-left', targetColumnId)"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Влево
      </div>

      <div
        class="col-ctx-menu__item"
        :class="{ 'col-ctx-menu__item--disabled': isLast }"
        @click="!isLast && emit('move-right', targetColumnId)"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        Вправо
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

interface ColInfo {
  id: string
  name: string
  visible: boolean
}

const props = defineProps<{
  visible: boolean
  x: number
  y: number
  columns: ColInfo[]
  targetColumnId: string
}>()

const emit = defineEmits<{
  'close': []
  'toggle-visibility': [columnId: string]
  'move-left': [columnId: string]
  'move-right': [columnId: string]
}>()

const menuRef = ref<HTMLElement | null>(null)

const targetColumnName = computed(
  () => props.columns.find(c => c.id === props.targetColumnId)?.name ?? '',
)

const visibleColumns = computed(() => props.columns.filter(c => c.visible))

const targetIndexInVisible = computed(() => visibleColumns.value.findIndex(c => c.id === props.targetColumnId),
)

const isFirst = computed(() => targetIndexInVisible.value <= 0)
const isLast = computed(
  () => targetIndexInVisible.value >= visibleColumns.value.length - 1,
)

function onOutsideClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit('close')
  }
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      setTimeout(() => document.addEventListener('mousedown', onOutsideClick))
    } else {
      document.removeEventListener('mousedown', onOutsideClick)
    }
  },
)

onUnmounted(() => document.removeEventListener('mousedown', onOutsideClick))
</script>

<style scoped lang="scss">
.col-ctx-menu {
  position: fixed;
  z-index: 500;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-card);
  padding: 0.375rem;
  min-width: 200px;
  font-size: 0.875rem;

  &__section-title {
    padding: 0.25rem 0.5rem;
    color: var(--color-muted-foreground);
    font-weight: 600;
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  &__divider {
    margin: 0.375rem 0;
    border-top: 1px solid var(--color-border);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background 0.1s;
    cursor: pointer;
    border-radius: calc(var(--radius) - 2px);
    padding: 0.375rem 0.5rem;
    color: var(--color-foreground);
    user-select: none;

    &:hover {
      background: var(--color-muted);
    }

    &--check {
      padding-left: 0.25rem;
    }

    &--disabled {
      opacity: 0.4;
      cursor: not-allowed;

      &:hover {
        background: none;
      }
    }
  }

  &__check {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    width: 16px;
    height: 16px;
  }
}
</style>
