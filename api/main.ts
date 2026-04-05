import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { columnsRouter } from './routes/table-columns.ts'
import { rowsRouter } from './routes/table-rows.ts'
import { tablesRouter } from './routes/tables.ts'

const app = new OpenAPIHono()

app.use('*', logger())
app.use('*', cors({ origin: 'http://localhost:5173' }))

app.route('/api/tables', tablesRouter)
app.route('/api/columns', columnsRouter)
app.route('/api/rows', rowsRouter)

app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'Dynamic Tables API',
    version: '1.0.0',
  },
  servers: [
    {
      url: `http://localhost:${process.env.API_PORT}`,
    },
  ],
})

app.get('/docs', Scalar({
  url: '/openapi.json',
  pageTitle: 'Dynamic Tables API',
}))

app.get('/health', (ctx) => ctx.json({ ok: true }))

serve({
  fetch: app.fetch,
  port: process.env.API_PORT,
}, () => console.log('Server running on http://localhost:3000'))
