<template>
  <sidebar-group class="group-data-[collapsible=icon]:hidden">
    <sidebar-group-label>Favorites</sidebar-group-label>
    <sidebar-menu>
      <sidebar-menu-item
        v-for="item in favorites"
        :key="item.name"
      >
        <sidebar-menu-button as-child>
          <router-link
            :to="item.url"
            :title="item.name"
          >
            <span>{{ item.name }}</span>
          </router-link>
        </sidebar-menu-button>
        <dropdown-menu>
          <dropdown-menu-trigger as-child>
            <sidebar-menu-action show-on-hover>
              <more-horizontal-icon />
              <span class="sr-only">More</span>
            </sidebar-menu-action>
          </dropdown-menu-trigger>
          <dropdown-menu-content
            class="w-56 rounded-lg"
            :side="isMobile ? 'bottom' : 'right'"
            :align="isMobile ? 'end' : 'start'"
          >
            <dropdown-menu-item>
              <star-off-icon class="text-muted-foreground" />
              <span>Remove from Favorites</span>
            </dropdown-menu-item>
            <dropdown-menu-separator />
            <dropdown-menu-item>
              <link-icon class="text-muted-foreground" />
              <span>Copy Link</span>
            </dropdown-menu-item>
            <dropdown-menu-item>
              <arrow-up-right-icon class="text-muted-foreground" />
              <span>Open in New Tab</span>
            </dropdown-menu-item>
            <dropdown-menu-separator />
            <dropdown-menu-item>
              <trash2-icon class="text-muted-foreground" />
              <span>Delete</span>
            </dropdown-menu-item>
          </dropdown-menu-content>
        </dropdown-menu>
      </sidebar-menu-item>

      <sidebar-menu-item>
        <sidebar-menu-button class="text-sidebar-foreground/70">
          <more-horizontal-icon />
          <span>More</span>
        </sidebar-menu-button>
      </sidebar-menu-item>
    </sidebar-menu>
  </sidebar-group>
</template>

<script setup lang="ts">
import {
  ArrowUpRightIcon,
  LinkIcon,
  MoreHorizontalIcon,
  StarOffIcon,
  Trash2Icon,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

defineProps<{
  favorites: {
    id: number
    name: string
    url: string
  }[]
}>()

const { isMobile } = useSidebar()
</script>
