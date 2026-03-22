import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/client.ts'
import { columnOptions, tableColumns } from '../db/schema.ts'

export const columnsRouter = new Hono()

columnsRouter.post('/', async (c) => {
  const body = await c.req.json<{
    tableId: number
    name: string
    type: 'text' | 'number' | 'select' | 'toggle' | 'date'
    options?: { label: string, color?: string }[]
  }>()

  const [col] = await db
    .insert(tableColumns)
    .values({ tableId: body.tableId, name: body.name, type: body.type })
    .returning()

  if (body.type === 'select' && body.options?.length) {
    await db.insert(columnOptions).values(
      body.options.map((opt, i) => ({
        columnId: col.id,
        label: opt.label,
        color: opt.color,
        order: i,
      })),
    )
  }

  const result = await db.query.tableColumns.findFirst({
    where: eq(tableColumns.id, col.id),
    with: { options: true },
  })
  return c.json(result, 201)
})

columnsRouter.patch('/reorder', async (c) => {
  const { orderedIds } = await c.req.json<{ orderedIds: number[] }>()
  await db.transaction(async (tx) => {
    await Promise.all(
      orderedIds.map((id, index) => tx.update(tableColumns).set({ order: index }).where(eq(tableColumns.id, id))),
    )
  })
  return c.json({ ok: true })
})

columnsRouter.patch('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json<{ name?: string, visible?: boolean, order?: number }>()

  const patch: Partial<{ name: string, visible: boolean, order: number }> = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.visible !== undefined) patch.visible = body.visible
  if (body.order !== undefined) patch.order = body.order

  if (!Object.keys(patch).length) {
    return c.json({ error: 'No fields to update' }, 400)
  }

  await db.update(tableColumns).set(patch).where(eq(tableColumns.id, id))
  return c.json({ ok: true })
})

columnsRouter.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db.delete(tableColumns).where(eq(tableColumns.id, id))
  return c.json({ ok: true })
})
