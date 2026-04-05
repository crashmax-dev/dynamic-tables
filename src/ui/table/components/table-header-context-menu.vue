<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="fixed z-50 min-w-50 rounded-lg border bg-popover p-1.5 shadow-lg text-sm"
      :style="{ top: `${y}px`, left: `${x}px` }"
      @contextmenu.prevent
    >
      <p class="px-2 py-1 text-muted-foreground font-semibold text-[0.68rem] uppercase tracking-wide">
        Columns
      </p>
      <div
        v-for="col in columns"
        :key="col.id"
        class="flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer hover:bg-accent transition-colors select-none"
        @click="emit('toggle-visibility', col.id)"
      >
        <span class="flex shrink-0 items-center justify-center rounded border w-4 h-4 bg-background">
          <svg
            v-if="col.visible"
            width="10"
            height="10"
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
      <div class="my-1.5 border-t" />
      <p class="px-2 py-1 text-muted-foreground font-semibold text-[0.68rem] uppercase tracking-wide">
        {{ targetColumnName }}
      </p>
      <div
        class="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors select-none"
        :class="isFirst ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-accent'"
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
        Move left
      </div>
      <div
        class="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors select-none"
        :class="isLast ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-accent'"
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
        Move right
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
  (event: 'close'): void
  (event: 'toggle-visibility', columnId: string): void
  (event: 'move-left', columnId: string): void
  (event: 'move-right', columnId: string): void
}>()

const menuRef = ref<HTMLElement | null>(null)
const targetColumnName = computed(() => props.columns.find((c) => c.id === props.targetColumnId)?.name ?? '')
const visibleColumns = computed(() => props.columns.filter((c) => c.visible))
const targetIndexInVisible = computed(() => visibleColumns.value.findIndex((c) => c.id === props.targetColumnId))
const isFirst = computed(() => targetIndexInVisible.value === 0)
const isLast = computed(() => targetIndexInVisible.value === visibleColumns.value.length - 1)

function onOutsideClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) emit('close')
}

watch(() => props.visible, (val) => {
  if (val) setTimeout(() => document.addEventListener('mousedown', onOutsideClick))
  else document.removeEventListener('mousedown', onOutsideClick)
})

onUnmounted(() => document.removeEventListener('mousedown', onOutsideClick))
</script>
