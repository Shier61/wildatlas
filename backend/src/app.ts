import express, { Application } from 'express'
import cors from 'cors'
import compression from 'compression'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import 'express-async-errors'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { httpLogger } from './middleware/logger'
import { systemRouter } from './modules/system'
import { speciesRouter } from './modules/species'
import { identifyRouter } from './modules/identify'
// ============================================
// Add your domain module imports here
// ============================================
// Example: Product Module
// import { productRouter } from './modules/product.js'

export const createApp = (): Application => {
  const app = express()

  // HTTP request logging
  app.use(httpLogger)

  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN,
      credentials: env.CORS_ORIGIN !== '*',
    })
  )

  // Body parsing and compression
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(compression())

  // API routes - System & Health
  app.use(env.API_PREFIX, systemRouter)

  // Domain routes
  app.use(`${env.API_PREFIX}/species`, speciesRouter)
  app.use(`${env.API_PREFIX}/identify`, identifyRouter)

  // Static frontend (built with `pnpm build` in frontend/) — single-process deployment.
  // When present, the whole site is served from this Express instance.
  const distDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../frontend/dist'
  )
  if (existsSync(distDir)) {
    app.use(express.static(distDir, { maxAge: '1d', setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache')
    } }))
    // SPA fallback: client-side routes (/species, /identify, ...) all return index.html
    app.get('*', (req, res, next) => {
      if (req.path.startsWith(env.API_PREFIX)) return next()
      res.sendFile(path.join(distDir, 'index.html'))
    })
  }

  // Error handling
  app.use(errorHandler)

  return app
}
