import { z } from '@hono/zod-openapi'

export const ColumnTypeEnum = z.enum([
  'text',
  'number',
  'select',
  'toggle',
  'date',
])

export const ColumnOptionSchema = z.object({
  id: z.number(),
  label: z.string(),
  color: z.string().nullable(),
  order: z.number(),
  columnId: z.number(),
})

export const TableColumnSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: ColumnTypeEnum,
  visible: z.boolean(),
  options: z.array(ColumnOptionSchema),
})

export const TableMetaSchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.coerce.string(),
})

export const CellValueSchema = z.object({
  id: z.number(),
  rowId: z.number(),
  columnId: z.number(),
  value: z.string().nullable(),
})

export const TableRowSchema = z.object({
  id: z.number(),
  order: z.number(),
  createdAt: z.coerce.string(),
  values: z.array(CellValueSchema),
})

export const DynamicTableSchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.coerce.string(),
  columns: z.array(TableColumnSchema),
  rows: z.array(TableRowSchema),
})

export const OkResponseSchema = z.object({
  ok: z.literal(true),
})
export const ErrorSchema = z.object({
  error: z.string(),
})
