import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/client.ts'
import { tableColumns, tables } from '../db/schema.ts'

export const tablesRouter = new Hono()

tablesRouter.get('/', async (c) => {
  const result = await db.query.tables.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
  return c.json(result)
})

tablesRouter.post('/', async (c) => {
  const { name } = await c.req.json<{ name: string }>()
  if (!name?.trim()) return c.json({ error: 'name is required' }, 400)

  const [table] = await db.insert(tables).values({ name: name.trim() }).returning()
  return c.json(table, 201)
})

tablesRouter.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db.delete(tables).where(eq(tables.id, id))
  return c.json({ ok: true })
})

tablesRouter.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))

  const visibleColumns = await db
    .select({ id: tableColumns.id })
    .from(tableColumns)
    .where(and(eq(tableColumns.tableId, id), eq(tableColumns.visible, true)))

  const visibleColumnIds = visibleColumns.map(c => c.id)

  const table = await db.query.tables.findFirst({
    where: eq(tables.id, id),
    with: {
      columns: {
        columns: {
          tableId: false,
          order: false,
        },
        with: { options: { orderBy: (o, { asc }) => [asc(o.order)] } },
        orderBy: (col, { asc }) => [asc(col.order)],
      },
      rows: {
        columns: {
          tableId: false,
        },
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
  return c.json(table)
})
