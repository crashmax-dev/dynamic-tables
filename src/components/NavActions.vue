<template>
  <div class="flex items-center gap-2 text-sm">
    <div class="hidden font-medium text-muted-foreground md:inline-block">
      Edit Oct 08
    </div>
    <ui-button
      variant="ghost"
      size="icon"
      class="h-7 w-7"
    >
      <star />
    </ui-button>
    <popover v-model:open="isOpen">
      <popover-trigger as-child>
        <button
          variant="ghost"
          size="icon"
          class="h-7 w-7 data-[state=open]:bg-accent"
        >
          <more-horizontal />
        </button>
      </popover-trigger>
      <popover-content
        class="w-56 overflow-hidden rounded-lg p-0"
        align="end"
      >
        <sidebar
          collapsible="none"
          class="bg-transparent"
        >
          <sidebar-content>
            <sidebar-group
              v-for="(group, index) in data"
              :key="index"
              class="border-b last:border-none"
            >
              <sidebar-group-content class="gap-0">
                <sidebar-menu>
                  <sidebar-menu-item
                    v-for="(item, groupIndex) in group"
                    :key="groupIndex"
                  >
                    <sidebar-menu-button>
                      <component :is="item.icon" /> <span>{{ item.label }}</span>
                    </sidebar-menu-button>
                  </sidebar-menu-item>
                </sidebar-menu>
              </sidebar-group-content>
            </sidebar-group>
          </sidebar-content>
        </sidebar>
      </popover-content>
    </popover>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Copy,
  CornerUpLeft,
  CornerUpRight,
  FileText,
  GalleryVerticalEnd,
  LineChart,
  Link,
  MoreHorizontal,
  Settings2,
  Star,
  Trash,
  Trash2,
} from 'lucide-vue-next'
import { ref } from 'vue'
import { Button as UiButton } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = [
  [
    {
      label: 'Customize Page',
      icon: Settings2,
    },
    {
      label: 'Turn into wiki',
      icon: FileText,
    },
  ],
  [
    {
      label: 'Copy Link',
      icon: Link,
    },
    {
      label: 'Duplicate',
      icon: Copy,
    },
    {
      label: 'Move to',
      icon: CornerUpRight,
    },
    {
      label: 'Move to Trash',
      icon: Trash2,
    },
  ],
  [
    {
      label: 'Undo',
      icon: CornerUpLeft,
    },
    {
      label: 'View analytics',
      icon: LineChart,
    },
    {
      label: 'Version History',
      icon: GalleryVerticalEnd,
    },
    {
      label: 'Show delete pages',
      icon: Trash,
    },
    {
      label: 'Notifications',
      icon: Bell,
    },
  ],
  [
    {
      label: 'Import',
      icon: ArrowUp,
    },
    {
      label: 'Export',
      icon: ArrowDown,
    },
  ],
]

const isOpen = ref(false)
</script>
