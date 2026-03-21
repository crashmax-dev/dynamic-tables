import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/client'
import { entityValues, tableRows } from '../db/schema'

export const rowsRouter = new Hono()

// POST /rows — добавить строку
rowsRouter.post('/', async (c) => {
  const { tableId } = await c.req.json<{ tableId: number }>()
  const [row] = await db.insert(tableRows).values({ tableId }).returning()
  return c.json({ ...row, values: [] }, 201)
})

// DELETE /rows/:id
rowsRouter.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db.delete(tableRows).where(eq(tableRows.id, id))
  return c.json({ ok: true })
})

// PUT /rows/:rowId/values — upsert значения ячейки
rowsRouter.put('/:rowId/values', async (c) => {
  const rowId = Number(c.req.param('rowId'))
  const { columnId, value } = await c.req.json<{ columnId: number, value: string }>()

  const existing = await db.query.entityValues.findFirst({
    where: and(eq(entityValues.rowId, rowId), eq(entityValues.columnId, columnId)),
  })

  if (existing) {
    await db.update(entityValues).set({ value }).where(eq(entityValues.id, existing.id))
  } else {
    await db.insert(entityValues).values({ rowId, columnId, value })
  }

  return c.json({ ok: true })
})
