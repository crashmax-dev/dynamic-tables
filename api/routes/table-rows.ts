import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/client.ts'
import { entityValues, tableRows } from '../db/schema.ts'
import { OkResponseSchema, TableRowSchema } from '../db/zod-schemas.ts'

export const rowsRouter = new OpenAPIHono()

const IdParamSchema = z.object({ id: z.coerce.number() })

// POST /api/rows
rowsRouter.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['Rows'],
    summary: 'Add a row to a table',
    request: {
      body: {
        content: { 'application/json': { schema: z.object({ tableId: z.number() }) } },
      },
    },
    responses: {
      201: {
        content: { 'application/json': { schema: TableRowSchema } },
        description: 'Created row',
      },
    },
  }),
  async (c) => {
    const { tableId } = c.req.valid('json')
    const [row] = await db.insert(tableRows).values({ tableId }).returning()
    return c.json(TableRowSchema.parse({ ...row, values: [] }), 201)
  },
)

// PATCH /api/rows/reorder
rowsRouter.openapi(
  createRoute({
    method: 'patch',
    path: '/reorder',
    tags: ['Rows'],
    summary: 'Reorder rows',
    request: {
      body: {
        content: { 'application/json': { schema: z.object({ orderedIds: z.array(z.number()) }) } },
      },
    },
    responses: {
      200: {
        content: { 'application/json': { schema: OkResponseSchema } },
        description: 'Reordered',
      },
    },
  }),
  async (c) => {
    const { orderedIds } = c.req.valid('json')
    await Promise.all(
      orderedIds.map((id, index) => db.update(tableRows).set({ order: index }).where(eq(tableRows.id, id)),
      ),
    )
    return c.json({ ok: true as const })
  },
)

// DELETE /api/rows/:id
rowsRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Rows'],
    summary: 'Delete a row',
    request: { params: IdParamSchema },
    responses: {
      200: {
        content: { 'application/json': { schema: OkResponseSchema } },
        description: 'Deleted',
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    await db.delete(tableRows).where(eq(tableRows.id, id))
    return c.json({ ok: true as const })
  },
)

// PUT /api/rows/:rowId/values
rowsRouter.openapi(
  createRoute({
    method: 'put',
    path: '/{rowId}/values',
    tags: ['Rows'],
    summary: 'Upsert a cell value',
    request: {
      params: z.object({ rowId: z.coerce.number() }),
      body: {
        content: {
          'application/json': {
            schema: z.object({ columnId: z.number(), value: z.string() }),
          },
        },
      },
    },
    responses: {
      200: {
        content: { 'application/json': { schema: OkResponseSchema } },
        description: 'Upserted',
      },
    },
  }),
  async (c) => {
    const { rowId } = c.req.valid('param')
    const { columnId, value } = c.req.valid('json')
    const existing = await db.query.entityValues.findFirst({
      where: and(eq(entityValues.rowId, rowId), eq(entityValues.columnId, columnId)),
    })
    if (existing) {
      await db.update(entityValues).set({ value }).where(eq(entityValues.id, existing.id))
    } else {
      await db.insert(entityValues).values({ rowId, columnId, value })
    }
    return c.json({ ok: true as const })
  },
)
