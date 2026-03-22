import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/client.ts'
import { entityValues, tableRows } from '../db/schema.ts'

export const rowsRouter = new Hono()

rowsRouter.post('/', async (c) => {
  const { tableId } = await c.req.json<{ tableId: number }>()
  const [row] = await db
    .insert(tableRows)
    .values({ tableId })
    .returning()
  return c.json({ ...row, values: [] }, 201)
})

rowsRouter.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db
    .delete(tableRows)
    .where(eq(tableRows.id, id))
  return c.json({ ok: true })
})

rowsRouter.patch('/reorder', async (c) => {
  const { orderedIds } = await c.req.json<{ orderedIds: number[] }>()
  const result = orderedIds.map((id, index) => {
    return db
      .update(tableRows)
      .set({ order: index })
      .where(eq(tableRows.id, id))
  })
  await Promise.all(result)
  return c.json({ ok: true })
})

rowsRouter.put('/:rowId/values', async (c) => {
  const rowId = Number(c.req.param('rowId'))
  const { columnId, value } = await c.req.json<{
    columnId: number
    value: string
  }>()

  const existing = await db.query.entityValues.findFirst({
    where: and(
      eq(entityValues.rowId, rowId),
      eq(entityValues.columnId, columnId),
    ),
  })

  if (existing) {
    await db.update(entityValues)
      .set({ value })
      .where(eq(entityValues.id, existing.id))
  } else {
    await db
      .insert(entityValues)
      .values({ rowId, columnId, value })
  }

  return c.json({ ok: true })
})
