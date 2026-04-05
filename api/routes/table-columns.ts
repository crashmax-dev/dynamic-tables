import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.ts'
import { columnOptions, tableColumns } from '../db/schema.ts'
import {
  ColumnTypeEnum,
  ErrorSchema,
  OkResponseSchema,
  TableColumnSchema,
} from '../db/zod-schemas.ts'

export const columnsRouter = new OpenAPIHono()

const CreateColumnBodySchema = z.object({
  tableId: z.number(),
  name: z.string().min(1),
  type: ColumnTypeEnum,
  options: z
    .array(z.object({ label: z.string(), color: z.string().optional() }))
    .optional(),
})

const UpdateColumnBodySchema = z.object({
  name: z.string().optional(),
  visible: z.boolean().optional(),
  order: z.number().optional(),
})

const IdParamSchema = z.object({ id: z.coerce.number() })

// POST /api/columns
columnsRouter.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['Columns'],
    summary: 'Add a column to a table',
    request: {
      body: { content: { 'application/json': { schema: CreateColumnBodySchema } } },
    },
    responses: {
      201: {
        content: { 'application/json': { schema: TableColumnSchema } },
        description: 'Created column',
      },
    },
  }),
  async (c) => {
    const body = c.req.valid('json')
    const [col] = await db
      .insert(tableColumns)
      .values({ tableId: body.tableId, name: body.name, type: body.type })
      .returning()
    if (body.type === 'select' && body.options?.length) {
      await db.insert(columnOptions).values(
        body.options.map((opt, i) => ({
          columnId: col.id,
          label: opt.label,
          color: opt.color ?? null,
          order: i,
        })),
      )
    }
    const result = await db.query.tableColumns.findFirst({
      where: eq(tableColumns.id, col.id),
      with: { options: true },
    })
    return c.json(result, 201)
  },
)

// PATCH /api/columns/reorder
columnsRouter.openapi(
  createRoute({
    method: 'patch',
    path: '/reorder',
    tags: ['Columns'],
    summary: 'Reorder columns',
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
    await db.transaction(async (tx) => {
      await Promise.all(
        orderedIds.map((id, index) => tx.update(tableColumns).set({ order: index }).where(eq(tableColumns.id, id)),
        ),
      )
    })
    return c.json({ ok: true as const })
  },
)

// PATCH /api/columns/:id
// PATCH /api/columns/:id
columnsRouter.openapi(
  createRoute({
    method: 'patch',
    path: '/{id}',
    tags: ['Columns'],
    summary: 'Update a column',
    request: {
      params: IdParamSchema,
      body: { content: { 'application/json': { schema: UpdateColumnBodySchema } } },
    },
    responses: {
      200: {
        content: { 'application/json': { schema: OkResponseSchema } },
        description: 'Updated',
      },
      400: {
        content: { 'application/json': { schema: ErrorSchema } },
        description: 'No fields to update',
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const patch: Partial<{ name: string, visible: boolean, order: number }> = {}
    if (body.name !== undefined) patch.name = body.name
    if (body.visible !== undefined) patch.visible = body.visible
    if (body.order !== undefined) patch.order = body.order

    if (!Object.keys(patch).length) {
      return c.json({ error: 'No fields to update' }, 400)
    }

    await db.update(tableColumns).set(patch).where(eq(tableColumns.id, id))
    return c.json({ ok: true as const }, 200)
  },
)

// DELETE /api/columns/:id
columnsRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Columns'],
    summary: 'Delete a column',
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
    await db.delete(tableColumns).where(eq(tableColumns.id, id))
    return c.json({ ok: true as const })
  },
)
