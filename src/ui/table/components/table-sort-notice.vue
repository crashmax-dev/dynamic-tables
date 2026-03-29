<template>
  <div
    v-if="active"
    class="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-2 border-t bg-muted/90 backdrop-blur-sm px-3 py-1.5 text-muted-foreground text-xs"
  >
    <span>⠿ Drag & drop to reorder</span>
    <button
      class="ml-auto border-none bg-transparent p-0 text-foreground font-medium text-xs underline cursor-pointer hover:opacity-70"
      @click="emit('reset')"
    >
      Reset
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ active: boolean }>()

const emit = defineEmits<{
  (event: 'reset'): void
}>()
</script>
