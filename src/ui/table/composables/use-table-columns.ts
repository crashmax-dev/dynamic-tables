import { computed, reactive, toValue } from 'vue'
import type { GetApiTablesByIdResponses } from '@/api'
import { useReorderColumns, useUpdateColumn } from '@/queries/tables'
import type { TableRow } from '@/types'
import type { Table } from '@tanstack/vue-table'
import type { MaybeRefOrGetter } from 'vue'

export function useTableColumns(
  tableRef: MaybeRefOrGetter<GetApiTablesByIdResponses['200']>,
  tableCore: Table<TableRow>,
  localColumnOrder: { value: string[] },
) {
  const table = computed(() => toValue(tableRef))
  const { mutate: updateColumn } = useUpdateColumn()
  const { mutate: reorderColumns } = useReorderColumns()

  const ctxMenu = reactive({
    visible: false,
    x: 0,
    y: 0,
    columnId: '',
  })

  const ctxMenuColumns = computed(() => localColumnOrder.value
    .map(id => table.value.columns.find(c => String(c.id) === id))
    .filter(Boolean)
    .map(col => ({
      id: String(col!.id),
      name: col!.name,
      visible: col!.visible,
    })),
  )

  function onHeaderContextMenu(e: MouseEvent, columnId: string) {
    ctxMenu.x = e.clientX
    ctxMenu.y = e.clientY
    ctxMenu.columnId = columnId
    ctxMenu.visible = true
  }

  function onToggleVisibility(columnId: string) {
    const col = table.value.columns.find(c => String(c.id) === columnId)
    if (!col) return
    updateColumn({
      id: col.id,
      tableId: table.value.id,
      body: { visible: !col.visible },
    })
    ctxMenu.visible = false
  }

  function onMoveColumn(columnId: string, direction: -1 | 1) {
    const order = [...localColumnOrder.value]
    const currentIdx = order.indexOf(columnId)
    if (currentIdx === -1) return

    let targetIdx = -1
    let i = currentIdx + direction
    while (i >= 0 && i < order.length) {
      const isVisible = table.value.columns.find(c => String(c.id) === order[i])?.visible
      if (isVisible) {
        targetIdx = i
        break
      }
      i += direction
    }
    if (targetIdx === -1) return;
    [order[currentIdx], order[targetIdx]] = [order[targetIdx], order[currentIdx]]
    tableCore.setColumnOrder(order)
    reorderColumns({
      tableId: table.value.id,
      orderedIds: order.map(Number),
    })
    ctxMenu.visible = false
  }

  return {
    ctxMenu,
    ctxMenuColumns,
    onHeaderContextMenu,
    onToggleVisibility,
    onMoveColumn,
  }
}
