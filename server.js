import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITEST

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function createServer() {
  const app = express()
  const resolve = (p) => path.resolve(__dirname, p)

  // In dev use Vite's middleware; in prod serve dist
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite')
    const vite = await createViteServer({
      server: { middlewareMode: 'ssr' },
      appType: 'custom'
    })
    app.use(vite.middlewares)

    app.use('*', async (req, res) => {
      try {
        const url = req.originalUrl
        let template = fs.readFileSync(resolve('index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
  // Some CommonJS/UMD packages expect `module` to be defined in the global scope.
  // Provide a minimal shim so they can evaluate during SSR.
  if (typeof globalThis.module === 'undefined') globalThis.module = { exports: {} }
  const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')
        const appHtml = await render(url)
        const html = template.replace(`<!--ssr-outlet-->`, appHtml)
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
      } catch (e) {
        vite.ssrFixStacktrace(e)
        console.error(e)
        res.status(500).end(e.message)
      }
    })
  } else {
    const distPath = resolve('dist')
    app.use(express.static(distPath, { index: false }))

    app.use('*', (req, res) => {
      const url = req.originalUrl
      const template = fs.readFileSync(path.resolve(distPath, 'index.html'), 'utf-8')
      // In production we'd import the server bundle. Simplified here.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
    })
  }

  return { app }
}

createServer().then(({ app }) => {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
  })
})

export { createServer }
