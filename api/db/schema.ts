import { relations } from 'drizzle-orm'
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const columnTypeEnum = pgEnum('column_type', [
  'text',
  'number',
  'select',
  'toggle',
  'date',
])

export const tables = pgTable('tables', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tableColumns = pgTable('table_columns', {
  id: serial('id').primaryKey(),
  tableId: integer('table_id').notNull().references(() => tables.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: columnTypeEnum('type').notNull().default('text'),
  order: integer('order').notNull().default(0),
})

export const columnOptions = pgTable('column_options', {
  id: serial('id').primaryKey(),
  columnId: integer('column_id').notNull().references(() => tableColumns.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  color: text('color'), // опционально: hex-цвет метки
  order: integer('order').notNull().default(0),
})

export const tableRows = pgTable('table_rows', {
  id: serial('id').primaryKey(),
  tableId: integer('table_id').notNull().references(() => tables.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const entityValues = pgTable('entity_values', {
  id: serial('id').primaryKey(),
  rowId: integer('row_id').notNull().references(() => tableRows.id, { onDelete: 'cascade' }),
  columnId: integer('column_id').notNull().references(() => tableColumns.id, { onDelete: 'cascade' }),
  value: text('value'), // всё храним как text, на фронте приводим по типу
})

// Relations
export const tablesRelations = relations(tables, ({ many }) => ({
  columns: many(tableColumns),
  rows: many(tableRows),
}))

export const tableColumnsRelations = relations(tableColumns, ({ one, many }) => ({
  table: one(tables, { fields: [tableColumns.tableId], references: [tables.id] }),
  options: many(columnOptions),
  values: many(entityValues),
}))

export const columnOptionsRelations = relations(columnOptions, ({ one }) => ({
  column: one(tableColumns, { fields: [columnOptions.columnId], references: [tableColumns.id] }),
}))

export const tableRowsRelations = relations(tableRows, ({ one, many }) => ({
  table: one(tables, { fields: [tableRows.tableId], references: [tables.id] }),
  values: many(entityValues),
}))

export const entityValuesRelations = relations(entityValues, ({ one }) => ({
  row: one(tableRows, { fields: [entityValues.rowId], references: [tableRows.id] }),
  column: one(tableColumns, { fields: [entityValues.columnId], references: [tableColumns.id] }),
}))
