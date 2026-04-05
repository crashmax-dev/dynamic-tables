<template>
  <sidebar-menu>
    <sidebar-menu-item
      v-for="item in items"
      :key="item.title"
    >
      <sidebar-menu-button
        as-child
        :is-active="item.isActive"
      >
        <router-link :to="item.url">
          <component :is="item.icon" />
          <span>{{ item.title }}</span>
        </router-link>
      </sidebar-menu-button>
    </sidebar-menu-item>
  </sidebar-menu>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { LucideIcon } from 'lucide-vue-next'

defineProps<{
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
}>()
</script>
