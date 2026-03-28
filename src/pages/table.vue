<template>
  <div class="table-page">
    <aside class="table-page__sidebar">
      <div class="sidebar-header">
        <span class="sidebar-header__title">Таблицы</span>
        <button
          class="btn btn--ghost btn--icon"
          title="Новая таблица"
          @click="showNewTableDialog = true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <div
        v-if="listLoading"
        class="sidebar-loader"
      >
        <span
          v-for="n in 3"
          :key="n"
          class="skeleton"
        />
      </div>

      <nav
        v-else
        class="sidebar-nav"
      >
        <div
          v-for="table in tableList"
          :key="table.id"
          class="sidebar-nav__item"
          :class="{ 'sidebar-nav__item--active': table.id === activeTableId }"
          @click="activeTableId = table.id"
        >
          <span class="sidebar-nav__name">{{ table.name }}</span>
          <button
            class="sidebar-nav__delete"
            title="Удалить"
            @click.stop="confirmDeleteTable(table)"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <button
          v-if="!tableList?.length && !listLoading"
          class="sidebar-empty"
          @click="showNewTableDialog = true"
        >
          + Создать первую таблицу
        </button>
      </nav>
    </aside>

    <main class="table-page__content">
      <template v-if="activeTableId">
        <div
          v-if="tableLoading"
          class="content-loader"
        >
          <div class="spinner" />
          <span>Загрузка...</span>
        </div>

        <template v-else-if="activeTable">
          <div class="content-toolbar">
            <h1 class="content-toolbar__title">
              {{ activeTable.name }}
            </h1>
            <div class="content-toolbar__actions">
              <button
                class="btn btn--outline"
                @click="showColumnEditor = true"
              >
                + Столбец
              </button>
              <button
                class="btn btn--primary"
                :disabled="!isCanCreateRows"
                @click="onAddRow"
              >
                + Строка
              </button>
            </div>
          </div>

          <table-dynamic
            :table="activeTable"
            :loading="tableAsyncStatus === 'loading'"
            :virtual="activeTable.rows.length > 200"
            paginated
            @cell-change="onCellChange"
            @delete-row="confirmDeleteRow"
            @rows-reorder="onRowsReorder"
          />
        </template>
      </template>

      <div
        v-else
        class="content-empty"
      >
        <div class="content-empty__icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
            />
            <path d="M3 9h18M3 15h18M9 3v18" />
          </svg>
        </div>
        <p class="content-empty__text">
          Выбери таблицу или создай новую
        </p>
        <button
          class="btn btn--primary"
          @click="showNewTableDialog = true"
        >
          Создать таблицу
        </button>
      </div>
    </main>

    <app-dialog
      v-model="showNewTableDialog"
      title="Новая таблица"
    >
      <label class="field">
        <span class="field__label">Название</span>
        <input
          ref="newTableInput"
          v-model="newTableName"
          class="field__input"
          placeholder="Мои задачи"
          @keydown.enter="onCreateTable"
        >
      </label>
      <template #footer>
        <button
          class="btn btn--outline"
          @click="showNewTableDialog = false"
        >
          Отмена
        </button>
        <button
          class="btn btn--primary"
          :disabled="createLoading"
          @click="onCreateTable"
        >
          {{ createLoading ? 'Создаём...' : 'Создать' }}
        </button>
      </template>
    </app-dialog>

    <app-dialog
      v-model="showColumnEditor"
      title="Новый столбец"
    >
      <table-column-editor @save="onAddColumn" />
    </app-dialog>

    <app-dialog
      v-model="showDeleteDialog"
      title="Подтвердить удаление"
    >
      <p class="delete-confirm__text">
        {{ deleteTarget?.type === 'table'
          ? `Удалить таблицу «${deleteTarget.name}»? Все данные будут потеряны.`
          : 'Удалить строку? Это действие нельзя отменить.'
        }}
      </p>
      <template #footer>
        <button
          class="btn btn--outline"
          @click="showDeleteDialog = false"
        >
          Отмена
        </button>
        <button
          class="btn btn--danger"
          :disabled="deleteLoading"
          @click="onConfirmDelete"
        >
          {{ deleteLoading ? 'Удаляем...' : 'Удалить' }}
        </button>
      </template>
    </app-dialog>
  </div>
</template>

<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import { computed, nextTick, ref, watch } from 'vue'
import {
  useAddColumn,
  useAddRow,
  useCreateTable,
  useDeleteRow,
  useDeleteTable,
  useTableQuery,
  useTablesQuery,
  useUpsertValue,
} from '../queries/tables'
import AppDialog from '../ui/app-dialog.vue'
import TableColumnEditor from '../ui/table/components/table-column-editor.vue'
import TableDynamic from '../ui/table/table-dynamic.vue'
import type { TableMeta } from '../api/tables'
import type { ColumnType } from '../types'

const activeTableId = useRouteQuery<number | null>('table', undefined, {
  transform(val) {
    const num = Number(val)
    return Number.isNaN(num) ? null : num
  },
})

const {
  data: tableList,
  isLoading: listLoading,
} = useTablesQuery()

const {
  data: activeTable,
  isPending: tableLoading,
  asyncStatus: tableAsyncStatus,
} = useTableQuery(() => activeTableId.value)

const { mutateAsync: createTable, isLoading: createLoading } = useCreateTable()
const { mutateAsync: deleteTable } = useDeleteTable()
const { mutateAsync: addColumn } = useAddColumn()
const { mutateAsync: addRow } = useAddRow()
const { mutateAsync: deleteRow } = useDeleteRow()
const { mutate: upsertValue } = useUpsertValue()

const showNewTableDialog = ref(false)
const showColumnEditor = ref(false)
const showDeleteDialog = ref(false)
const newTableName = ref('')
const newTableInput = ref<HTMLInputElement | null>(null)
const deleteLoading = ref(false)
const deleteTarget = ref<{
  type: 'table'
  id: number
  name: string
} | { type: 'row', id: number } | null>(null)

const isCanCreateRows = computed(() => {
  if (!activeTable.value) return false
  return activeTable.value.columns.length > 0
})

watch(tableList, (list) => {
  if (list?.length && activeTableId.value == null) {
    activeTableId.value = list[0].id
  }
}, { immediate: true })

watch(showNewTableDialog, async (val) => {
  if (val) {
    await nextTick()
    newTableInput.value?.focus()
  }
})

async function onCreateTable() {
  if (!newTableName.value.trim()) return
  const t = await createTable(newTableName.value.trim())
  activeTableId.value = t.id
  newTableName.value = ''
  showNewTableDialog.value = false
}

async function onAddRow() {
  if (!activeTableId.value || !isCanCreateRows.value) return
  await addRow(activeTableId.value)
}

async function onAddColumn(payload: {
  name: string
  type: ColumnType
  options: { label: string, color: string }[]
}) {
  if (!activeTableId.value) return
  await addColumn({ tableId: activeTableId.value, ...payload })
  showColumnEditor.value = false
}

function onCellChange(rowId: number, columnId: number, value: string) {
  if (!activeTableId.value) return
  upsertValue({ rowId, columnId, value, tableId: activeTableId.value })
}

// rows-reorder эмитится из table-dynamic уже после сохранения в БД,
// здесь достаточно просто принять событие (можно использовать для аналитики / логов)
function onRowsReorder(_orderedIds: number[]) {}

function confirmDeleteTable(table: TableMeta) {
  deleteTarget.value = { type: 'table', id: table.id, name: table.name }
  showDeleteDialog.value = true
}

function confirmDeleteRow(rowId: number) {
  deleteTarget.value = { type: 'row', id: rowId }
  showDeleteDialog.value = true
}

async function onConfirmDelete() {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  try {
    if (deleteTarget.value.type === 'table') {
      const idToDelete = deleteTarget.value.id
      activeTableId.value = tableList.value?.find(t => t.id !== idToDelete)?.id ?? null
      await deleteTable(idToDelete)
    } else {
      await deleteRow({ id: deleteTarget.value.id, tableId: activeTableId.value! })
    }
    showDeleteDialog.value = false
  } finally {
    deleteLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.table-page {
  display: flex;
  background: var(--color-background);
  height: 100vh;
  overflow: hidden;
}

// ─── Sidebar ───────────────────────────────────────────
.table-page__sidebar {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  border-right: 1px solid var(--color-border);
  background: var(--color-card);
  width: 240px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 1rem 0.75rem;

  &__title {
    color: var(--color-muted-foreground);
    font-weight: 600;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
}

.sidebar-loader {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.75rem;
}

.skeleton {
  display: block;
  animation: shimmer 1.2s infinite;
  border-radius: var(--radius);
  background: linear-gradient(90deg, var(--color-muted) 25%, var(--color-border) 50%, var(--color-muted) 75%);
  background-size: 200% 100%;
  height: 32px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.sidebar-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  padding: 0.5rem;
  overflow-y: auto;

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.1s;
    cursor: pointer;
    border-radius: calc(var(--radius) - 2px);
    padding: 0.5rem 0.625rem;
    color: var(--color-foreground);
    font-size: 0.875rem;

    &:hover {
      background: var(--color-muted);

      .sidebar-nav__delete {
        opacity: 1;
      }
    }

    &--active {
      background: var(--color-muted);
      font-weight: 500;
    }
  }

  &__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__delete {
    display: flex;
    flex-shrink: 0;
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
    padding: 2px;
    color: var(--color-muted-foreground);

    &:hover {
      background: rgb(239 68 68 / 10%);
      color: #ef4444;
    }
  }
}

.sidebar-empty {
  transition:
    border-color 0.15s,
    color 0.15s;
  cursor: pointer;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
  background: none;
  padding: 0.625rem;
  color: var(--color-muted-foreground);
  font-size: 0.8rem;
  text-align: center;

  &:hover {
    border-color: var(--color-foreground);
    color: var(--color-foreground);
  }
}

// ─── Content ───────────────────────────────────────────
.table-page__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  overflow: auto;
}

.content-toolbar {
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  align-items: center;

  &__title {
    margin: 0;
    font-weight: 600;
    font-size: 1.25rem;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
  }
}

.content-loader {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  gap: 0.625rem;
  color: var(--color-muted-foreground);
  font-size: 0.875rem;
}

.content-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  color: var(--color-muted-foreground);

  &__icon {
    opacity: 0.3;
  }

  &__text {
    margin: 0;
    font-size: 0.9rem;
  }
}

// ─── Spinner ───────────────────────────────────────────
.spinner {
  animation: spin 0.6s linear infinite;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-foreground);
  border-radius: 50%;
  width: 18px;
  height: 18px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// ─── Delete confirm ────────────────────────────────────
.delete-confirm__text {
  margin: 0;
  color: var(--color-muted-foreground);
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>
