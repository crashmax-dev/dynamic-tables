<template>
  <div class="flex flex-1 flex-col min-w-0 overflow-hidden">
    <div class="flex shrink-0 items-center justify-between gap-2 px-6 py-3">
      <h1 class="font-semibold text-xl truncate">
        {{ activeTable?.name ?? 'Tables' }}
      </h1>
      <div class="flex shrink-0 gap-2">
        <ui-button
          v-if="activeTable"
          variant="outline"
          size="sm"
          @click="openAddColumnDialog"
        >
          <plus-icon class="h-4 w-4" />
          Add column
        </ui-button>
        <ui-button
          v-if="activeTable"
          size="sm"
          :disabled="!isCanCreateRows"
          @click="onAddRow"
        >
          <plus-icon class="h-4 w-4" />
          Add row
        </ui-button>
        <ui-button
          size="sm"
          @click="openCreateTableDialog"
        >
          <table-icon class="h-4 w-4" />
          New table
        </ui-button>
      </div>
    </div>

    <div
      v-if="tableLoading"
      class="flex flex-1 items-center justify-center gap-2 text-muted-foreground text-sm"
    >
      <loader2-icon class="h-4 w-4 animate-spin" />
      Loading…
    </div>

    <div
      v-else-if="!activeTableId || !activeTable"
      class="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground"
    >
      <table-icon class="h-12 w-12 opacity-20" />
      <p class="text-sm">
        Select a table or create a new one
      </p>
      <ui-button
        size="sm"
        @click="openCreateTableDialog"
      >
        Create table
      </ui-button>
    </div>

    <template v-else>
      <table-dynamic
        :table="activeTable"
        :loading="tableAsyncStatus === 'loading'"
        :virtual="(activeTable.rows.length ?? 0) > 200"
        paginated
        @cell-change="onCellChange"
        @delete-row="openDeleteRowDialog"
        @rows-reorder="onRowsReorder"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import {
  Loader2 as Loader2Icon,
  Plus as PlusIcon,
  Table as TableIcon,
} from 'lucide-vue-next'
import { computed, h, watch } from 'vue'
import { Button as UiButton } from '@/components/ui/button'
import { useBreadcrumbs } from '@/composables/use-breadcrumbs'
import { useDialog } from '@/composables/use-dialog'
import {
  useAddColumn,
  useAddRow,
  useCreateTable,
  useDeleteRow,
  // useDeleteTable,
  useTableQuery,
  useTablesQuery,
  useUpsertValue,
} from '@/queries/tables'
import type { ColumnType } from '@/types'
import TableDynamic from '@/ui/table/table-dynamic.vue'
import AddColumnDialog from './dialogs/add-column-dialog.vue'
import CreateTableDialog from './dialogs/create-table-dialog.vue'
import DeleteConfirmDialog from './dialogs/delete-confirm-dialog.vue'

const activeTableId = useRouteQuery<number | null>('table', undefined, {
  transform: (val) => {
    const num = Number(val)
    return Number.isNaN(num) ? null : num
  },
})

const { data: tableList } = useTablesQuery()
const {
  data: activeTable,
  isPending: tableLoading,
  asyncStatus: tableAsyncStatus,
} = useTableQuery(() => activeTableId.value)

const { mutateAsync: createTable } = useCreateTable()
// const { mutateAsync: deleteTable } = useDeleteTable()
const { mutateAsync: addColumn } = useAddColumn()
const { mutateAsync: addRow } = useAddRow()
const { mutateAsync: deleteRow } = useDeleteRow()
const { mutate: upsertValue } = useUpsertValue()

const dialog = useDialog()
const { setBreadcrumbs, clearBreadcrumbs } = useBreadcrumbs()

const isCanCreateRows = computed(() => (activeTable.value?.columns.length ?? 0) > 0)

watch(tableList, (list) => {
  if (list?.length && !activeTableId.value) activeTableId.value = list[0].id
}, { immediate: true })

// Динамические breadcrumbs: Tables > Имя таблицы
watch(activeTable, (table) => {
  if (table) {
    setBreadcrumbs([
      { label: 'Tables', to: '/tables' },
      { label: table.name },
    ])
  } else {
    clearBreadcrumbs()
  }
}, { immediate: true })

function openCreateTableDialog() {
  dialog.open(h(CreateTableDialog, {
    onCreated: async (name: string) => {
      const t = await createTable(name)
      activeTableId.value = t.id
    },
  }))
}

function openAddColumnDialog() {
  dialog.open(h(AddColumnDialog, {
    onAdd: async (payload: {
      name: string
      type: ColumnType
      options: { label: string, color: string }[]
    }) => {
      if (!activeTableId.value) return
      await addColumn({ tableId: activeTableId.value, ...payload })
    },
  }))
}

function openDeleteRowDialog(rowId: number) {
  dialog.open(h(DeleteConfirmDialog, {
    type: 'row',
    onConfirm: async () => {
      await deleteRow({ id: rowId, tableId: activeTableId.value! })
    },
  }))
}

async function onAddRow() {
  if (!activeTableId.value || !isCanCreateRows.value) return
  await addRow(activeTableId.value)
}

function onCellChange(rowId: number, columnId: number, value: string) {
  if (!activeTableId.value) return
  upsertValue({ rowId, columnId, value, tableId: activeTableId.value })
}

function onRowsReorder(_orderedIds: number[]) {}
</script>
