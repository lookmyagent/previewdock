import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, resolve, sep } from 'node:path'

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
}

function serveBuiltSurface(prefix: string, directory: string) {
  const root = resolve(import.meta.dirname, directory)
  return {
    name: `previewdock-surface-${prefix}`,
    configureServer(server: { middlewares: { use(handler: (request: { url?: string }, response: any, next: () => void) => void): void } }) {
      server.middlewares.use((request, response, next) => {
        const pathname = decodeURIComponent(new URL(request.url || '/', 'http://previewdock.local').pathname)
        if (pathname !== prefix.slice(0, -1) && !pathname.startsWith(prefix)) return next()
        if (pathname === prefix.slice(0, -1)) {
          response.statusCode = 302
          response.setHeader('Location', prefix)
          response.end()
          return
        }

        let relativePath = pathname.slice(prefix.length)
        if (!relativePath || relativePath.endsWith('/')) relativePath += 'index.html'
        let target = resolve(root, relativePath)
        if (!extname(target) && existsSync(`${target}.html`)) target = `${target}.html`
        if (existsSync(target) && statSync(target).isDirectory()) target = resolve(target, 'index.html')
        // Playground is a client-side workbench. Keep deep links and repeated
        // navigation inside its entry document instead of allowing the portal
        // server to turn a route without a generated file into a 404.
        if (prefix === '/playground/' && !existsSync(target) && !extname(pathname)) {
          target = resolve(root, 'index.html')
        }
        if (!target.startsWith(`${root}${sep}`) || !existsSync(target) || !statSync(target).isFile()) return next()

        response.statusCode = 200
        response.setHeader('Content-Type', contentTypes[extname(target)] || 'application/octet-stream')
        if (prefix === '/playground/') {
          response.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
          response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
        }
        createReadStream(target).pipe(response)
      })
    },
  }
}

export default defineConfig({
  plugins: [
    serveBuiltSurface('/docs/', '../../docs/.vitepress/dist'),
    serveBuiltSurface('/playground/', '../playground/dist'),
    vue(),
  ],
})
