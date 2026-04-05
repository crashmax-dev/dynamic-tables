<template>
  <sidebar
    class="border-r-0"
    v-bind="props"
  >
    <sidebar-header>
      <nav-main :items="data.navMain" />
    </sidebar-header>
    <sidebar-content>
      <nav-favorites :favorites="projects" />
      <nav-secondary
        :items="data.navSecondary"
        class="mt-auto"
      />
    </sidebar-content>
    <sidebar-rail />
  </sidebar>
</template>

<script setup lang="ts">
import {
  Blocks,
  Home,
  MessageCircleQuestion,
  Search,
  Settings2,
  Trash2,
} from 'lucide-vue-next'
import { computed } from 'vue'
import NavFavorites from '@/components/NavFavorites.vue'
import NavMain from '@/components/NavMain.vue'
import NavSecondary from '@/components/NavSecondary.vue'
import type { SidebarProps } from '@/components/ui/sidebar'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useTablesQuery } from '@/queries/tables'

const props = defineProps<SidebarProps>()

const {
  data: tableList,
  // isLoading: listLoading,
} = useTablesQuery()

const projects = computed(() => {
  if (!tableList.value) return []
  return tableList.value.data.map(table => ({
    id: table.id,
    name: table.name,
    url: `/tables?table=${table.id}`,
  }))
})

// This is sample data.
const data = {
  navMain: [
    {
      title: 'Home',
      url: '#',
      icon: Home,
      isActive: true,
    },
    {
      title: 'Search',
      url: '#',
      icon: Search,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
    },
    {
      title: 'Templates',
      url: '#',
      icon: Blocks,
    },
    {
      title: 'Trash',
      url: '#',
      icon: Trash2,
    },
    {
      title: 'Help',
      url: '#',
      icon: MessageCircleQuestion,
    },
  ],
}
</script>
