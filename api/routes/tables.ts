import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/client.ts'
import { tableColumns, tables } from '../db/schema.ts'
import {
  DynamicTableSchema,
  ErrorSchema,
  OkResponseSchema,
  TableMetaSchema,
} from '../db/zod-schemas.ts'

export const tablesRouter = new OpenAPIHono()

// GET /api/tables
tablesRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Tables'],
    summary: 'Get all tables',
    responses: {
      200: {
        content: { 'application/json': { schema: z.array(TableMetaSchema) } },
        description: 'List of tables',
      },
    },
  }),
  async (c) => {
    const result = await db.query.tables.findMany({
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    })
    return c.json(result)
  },
)

// POST /api/tables
tablesRouter.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['Tables'],
    summary: 'Create a table',
    request: {
      body: {
        content: { 'application/json': { schema: z.object({ name: z.string().min(1) }) } },
      },
    },
    responses: {
      201: {
        content: { 'application/json': { schema: TableMetaSchema } },
        description: 'Created table',
      },
      400: {
        content: { 'application/json': { schema: ErrorSchema } },
        description: 'Validation error',
      },
    },
  }),
  async (c) => {
    const { name } = c.req.valid('json')
    const [table] = await db.insert(tables).values({ name: name.trim() }).returning()
    return c.json(table, 201)
  },
)

// GET /api/tables/:id
tablesRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Tables'],
    summary: 'Get table with rows and columns',
    request: {
      params: z.object({ id: z.coerce.number() }),
    },
    responses: {
      200: {
        content: { 'application/json': { schema: DynamicTableSchema } },
        description: 'Full table data',
      },
      404: {
        content: { 'application/json': { schema: ErrorSchema } },
        description: 'Not found',
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const visibleColumns = await db
      .select({ id: tableColumns.id })
      .from(tableColumns)
      .where(and(eq(tableColumns.tableId, id), eq(tableColumns.visible, true)))
    const visibleColumnIds = visibleColumns.map((c) => c.id)
    const table = await db.query.tables.findFirst({
      where: eq(tables.id, id),
      with: {
        columns: {
          columns: { tableId: false, order: false },
          with: { options: { orderBy: (o, { asc }) => [asc(o.order)] } },
          orderBy: (col, { asc }) => [asc(col.order)],
        },
        rows: {
          columns: { tableId: false },
          with: {
            values: visibleColumnIds.length
              ? { where: (v, { inArray }) => inArray(v.columnId, visibleColumnIds) }
              : undefined,
          },
          orderBy: (r, { asc }) => [asc(r.order), asc(r.createdAt)],
        },
      },
    })

    if (!table) return c.json({ error: 'Not found' }, 404)
    return c.json(DynamicTableSchema.parse(table), 200)
  },
)

// DELETE /api/tables/:id
tablesRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Tables'],
    summary: 'Delete a table',
    request: { params: z.object({ id: z.coerce.number() }) },
    responses: {
      200: {
        content: { 'application/json': { schema: OkResponseSchema } },
        description: 'Deleted',
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    await db.delete(tables).where(eq(tables.id, id))
    return c.json({ ok: true as const })
  },
)
