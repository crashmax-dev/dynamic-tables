import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed } from 'vue'
import type { TableRow } from '@/types'
import type { Ref } from 'vue'

export function useTableVirtualizer(
  scrollRef: Ref<HTMLElement | null>,
  rows: Ref<TableRow[]>,
  virtual: Ref<boolean>,
) {
  const rowVirtualizer = computed(() => {
    if (!virtual.value || !scrollRef.value) return null
    const virtualizer = useVirtualizer({
      count: rows.value.length,
      getScrollElement: () => scrollRef.value,
      estimateSize: () => 44,
      overscan: 10,
    })
    return virtualizer.value
  })

  const virtualRows = computed(() => {
    return rowVirtualizer.value?.getVirtualItems() ?? []
  })

  return {
    scrollRef,
    rowVirtualizer,
    virtualRows,
  }
}
