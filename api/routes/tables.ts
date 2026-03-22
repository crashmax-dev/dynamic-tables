import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/client.ts'
import { tables } from '../db/schema.ts'

export const tablesRouter = new Hono()

// GET /tables — список таблиц
tablesRouter.get('/', async (c) => {
  const result = await db.query.tables.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
  return c.json(result)
})

// POST /tables — создать таблицу
tablesRouter.post('/', async (c) => {
  const { name } = await c.req.json<{ name: string }>()
  if (!name?.trim()) return c.json({ error: 'name is required' }, 400)

  const [table] = await db.insert(tables).values({ name: name.trim() }).returning()
  return c.json(table, 201)
})

// DELETE /tables/:id
tablesRouter.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db.delete(tables).where(eq(tables.id, id))
  return c.json({ ok: true })
})

// GET /tables/:id — таблица с колонками, строками и значениями
tablesRouter.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))

  const table = await db.query.tables.findFirst({
    where: eq(tables.id, id),
    with: {
      columns: {
        with: { options: { orderBy: (o, { asc }) => [asc(o.order)] } },
        orderBy: (col, { asc }) => [asc(col.order)],
      },
      rows: {
        with: { values: true },
        orderBy: (r, { asc }) => [asc(r.createdAt)],
      },
    },
  })

  if (!table) return c.json({ error: 'Not found' }, 404)
  return c.json(table)
})
