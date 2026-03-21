import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/client'
import { columnOptions, tableColumns } from '../db/schema'

export const columnsRouter = new Hono()

// POST /columns — добавить столбец к таблице
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

  // Возвращаем колонку с опциями
  const result = await db.query.tableColumns.findFirst({
    where: eq(tableColumns.id, col.id),
    with: { options: true },
  })
  return c.json(result, 201)
})

// PATCH /columns/:id — переименовать столбец
columnsRouter.patch('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const { name } = await c.req.json<{ name: string }>()
  await db.update(tableColumns).set({ name }).where(eq(tableColumns.id, id))
  return c.json({ ok: true })
})

// DELETE /columns/:id
columnsRouter.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db.delete(tableColumns).where(eq(tableColumns.id, id))
  return c.json({ ok: true })
})
