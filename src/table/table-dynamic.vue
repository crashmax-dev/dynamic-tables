<template>
  <div class="dynamic-table">
    <div class="dynamic-table__header">
      <h2 class="dynamic-table__title">
        {{ table.name }}
      </h2>
    </div>

    <div class="dynamic-table__scroll">
      <table class="dt">
        <thead>
          <tr v-if="table.columns.length">
            <th
              v-for="col in table.columns"
              :key="col.id"
              class="dt__th"
            >
              <span class="dt__col-name">{{ col.name }}</span>
              <span class="dt__col-type">{{ col.type }}</span>
            </th>
            <th class="dt__th dt__th--actions" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in table.rows"
            :key="row.id"
            class="dt__row"
          >
            <td
              v-for="col in table.columns"
              :key="col.id"
              class="dt__td"
            >
              <table-cell-renderer
                :column="col"
                :value="getCellValue(row, col.id)"
                editable
                @change="emit('cell-change', row.id, col.id, $event)"
              />
            </td>

            <td class="dt__td dt__td--actions">
              <button
                class="dt__row-delete"
                title="Удалить строку"
                @click="emit('delete-row', row.id)"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="!table.rows.length">
            <td
              :colspan="table.columns.length"
              class="dt__empty"
            >
              Нет данных
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import TableCellRenderer from './table-cell-renderer.vue'
import type { DynamicTable, TableRow } from '../types'

defineProps<{
  table: DynamicTable
}>()

const emit = defineEmits<{
  'cell-change': [rowId: number, columnId: number, value: string]
  'delete-row': [rowId: number]
}>()

function getCellValue(row: TableRow, columnId: number) {
  return row.values.find(v => v.columnId === columnId)?.value ?? null
}
</script>

<style scoped lang="scss">
.dynamic-table {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-card);
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 1.25rem;
  }

  &__title {
    margin: 0;
    font-weight: 600;
    font-size: 1rem;
  }

  &__scroll {
    overflow-x: auto;
  }
}

.dt {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.875rem;

  &__td--actions {
    padding: 0 0.25rem;
    width: 36px;
  }

  &__row-delete {
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition:
      color 0.15s,
      background 0.15s,
      opacity 0.15s;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background: none;
    padding: 4px;
    color: var(--color-muted-foreground);

    .dt__row:hover & {
      opacity: 1;
    }

    &:hover {
      background: rgb(239 68 68 / 10%);
      color: #ef4444;
    }
  }

  &__th {
    border-bottom: 1px solid var(--color-border);
    background: var(--color-muted);
    padding: 0.625rem 0.75rem;
    font-weight: 500;
    text-align: left;
    white-space: nowrap;
  }

  &__col-name {
    display: block;
    color: var(--color-foreground);
  }

  &__col-type {
    display: block;
    color: var(--color-muted-foreground);
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  &__row {
    border-bottom: 1px solid var(--color-border);

    &:hover {
      background: var(--color-muted);
    }
  }

  &__td {
    vertical-align: middle;
    padding: 0.25rem 0.5rem;
  }

  &__empty {
    padding: 2rem;
    color: var(--color-muted-foreground);
    text-align: center;
  }
}
</style>
