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
  id: serial().primaryKey(),
  name: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
})

export const tableColumns = pgTable('table_columns', {
  id: serial().primaryKey(),
  tableId: integer()
    .notNull()
    .references(() => tables.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  type: columnTypeEnum().notNull().default('text'),
  order: integer().notNull().default(0),
})

export const columnOptions = pgTable('column_options', {
  id: serial().primaryKey(),
  columnId: integer()
    .notNull()
    .references(() => tableColumns.id, { onDelete: 'cascade' }),
  label: text().notNull(),
  color: text(),
  order: integer().notNull().default(0),
})

export const tableRows = pgTable('table_rows', {
  id: serial().primaryKey(),
  tableId: integer()
    .notNull()
    .references(() => tables.id, { onDelete: 'cascade' }),
  createdAt: timestamp().defaultNow().notNull(),
})

export const entityValues = pgTable('entity_values', {
  id: serial().primaryKey(),
  rowId: integer()
    .notNull()
    .references(() => tableRows.id, { onDelete: 'cascade' }),
  columnId: integer()
    .notNull()
    .references(() => tableColumns.id, { onDelete: 'cascade' }),
  value: text(),
})

// relations
export const tablesRelations = relations(tables, ({ many }) => ({
  columns: many(tableColumns),
  rows: many(tableRows),
}))

export const tableColumnsRelations = relations(tableColumns, ({ one, many }) => ({
  table: one(tables, {
    fields: [tableColumns.tableId],
    references: [tables.id],
  }),
  options: many(columnOptions),
  values: many(entityValues),
}))

export const columnOptionsRelations = relations(columnOptions, ({ one }) => ({
  column: one(tableColumns, {
    fields: [columnOptions.columnId],
    references: [tableColumns.id],
  }),
}))

export const tableRowsRelations = relations(tableRows, ({ one, many }) => ({
  table: one(tables, {
    fields: [tableRows.tableId],
    references: [tables.id],
  }),
  values: many(entityValues),
}))

export const entityValuesRelations = relations(entityValues, ({ one }) => ({
  row: one(tableRows, {
    fields: [entityValues.rowId],
    references: [tableRows.id],
  }),
  column: one(tableColumns, {
    fields: [entityValues.columnId],
    references: [tableColumns.id],
  }),
}))
