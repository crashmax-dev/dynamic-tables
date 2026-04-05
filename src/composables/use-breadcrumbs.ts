import { ref } from 'vue'

export interface BreadcrumbItem {
  label: string
  to?: string
}

const dynamicCrumbs = ref<BreadcrumbItem[]>([])

export function useBreadcrumbs() {
  function setBreadcrumbs(crumbs: BreadcrumbItem[]) {
    dynamicCrumbs.value = crumbs
  }

  function clearBreadcrumbs() {
    dynamicCrumbs.value = []
  }

  return {
    dynamicCrumbs,
    setBreadcrumbs,
    clearBreadcrumbs,
  }
}
