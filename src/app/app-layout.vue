<template>
  <sidebar-provider>
    <app-sidebar />
    <sidebar-inset class="min-w-0 overflow-hidden">
      <header class="flex h-14 shrink-0 items-center gap-2 px-4">
        <sidebar-trigger />
        <breadcrumb>
          <breadcrumb-list>
            <template
              v-for="(crumb, i) in breadcrumbs"
              :key="i"
            >
              <breadcrumb-item>
                <breadcrumb-link
                  v-if="crumb.to"
                  :href="crumb.to"
                >
                  {{ crumb.label }}
                </breadcrumb-link>
                <breadcrumb-page v-else>
                  {{ crumb.label }}
                </breadcrumb-page>
              </breadcrumb-item>
              <breadcrumb-separator v-if="i < breadcrumbs.length - 1" />
            </template>
          </breadcrumb-list>
        </breadcrumb>
        <div class="ml-auto">
          <nav-actions />
        </div>
      </header>
      <div
        class="flex flex-1 flex-col min-w-0"
        :class="isScrollable ? 'overflow-auto' : 'overflow-hidden'"
      >
        <router-view />
      </div>
    </sidebar-inset>
  </sidebar-provider>

  <app-dialog />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import NavActions from '@/components/NavActions.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useBreadcrumbs } from '@/composables/use-breadcrumbs'
import AppDialog from './app-dialog.vue'

const route = useRoute()
const { dynamicCrumbs, clearBreadcrumbs } = useBreadcrumbs()

watch(() => route.path, () => clearBreadcrumbs())

const isScrollable = computed(() => route.meta.scrollable !== false)

const breadcrumbs = computed(() => {
  if (dynamicCrumbs.value.length > 0) return dynamicCrumbs.value
  const label = route.meta.breadcrumb as string | undefined
  return label ? [{ label }] : []
})
</script>
