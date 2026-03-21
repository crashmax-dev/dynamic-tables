import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { columnsRouter } from './routes/table-columns'
import { rowsRouter } from './routes/table-rows'
import { tablesRouter } from './routes/tables'
import 'dotenv/config'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({ origin: 'http://localhost:5173' }))

app.route('/api/tables', tablesRouter)
app.route('/api/columns', columnsRouter)
app.route('/api/rows', rowsRouter)

app.get('/health', (c) => c.json({ ok: true }))

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('Server running on http://localhost:3000')
})
