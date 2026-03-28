import { ref } from 'vue'
import { useReorderRows } from '../../../queries/tables'
import type { Ref } from 'vue'
import type { TableRow } from '../../../types'

export function useTableDrag(
  localRows: Ref<TableRow[]>,
  tableId: Ref<number>,
) {
  const { mutate: reorderRows } = useReorderRows()
  const dragRowId = ref<number | null>(null)

  function onDragStart(rowId: number) {
    dragRowId.value = rowId
  }

  function onDragOver(rowId: number) {
    if (dragRowId.value === null || dragRowId.value === rowId) return
    const rows = [...localRows.value]
    const fromIdx = rows.findIndex(r => r.id === dragRowId.value)
    const toIdx = rows.findIndex(r => r.id === rowId)
    if (fromIdx === -1 || toIdx === -1) return
    const [moved] = rows.splice(fromIdx, 1)
    rows.splice(toIdx, 0, moved)
    localRows.value = rows
  }

  function onDragEnd() {
    dragRowId.value = null
    const orderedIds = localRows.value.map(r => r.id)
    reorderRows({ tableId: tableId.value, orderedIds })
  }

  return {
    dragRowId,
    onDragStart,
    onDragOver,
    onDragEnd,
  }
}
