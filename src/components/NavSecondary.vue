<template>
  <sidebar-group>
    <sidebar-group-content>
      <sidebar-menu>
        <sidebar-menu-item
          v-for="item in items"
          :key="item.title"
        >
          <sidebar-menu-button as-child>
            <a :href="item.url">
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
            </a>
          </sidebar-menu-button>
          <sidebar-menu-badge v-if="item.badge">
            <component :is="item.badge" />
          </sidebar-menu-badge>
        </sidebar-menu-item>
      </sidebar-menu>
    </sidebar-group-content>
  </sidebar-group>
</template>

<script setup lang="ts">
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import type { LucideIcon } from 'lucide-vue-next'
import type { Component } from 'vue'

defineProps<{
  items: {
    title: string
    url: string
    icon: LucideIcon
    badge?: Component
  }[]
}>()
</script>
