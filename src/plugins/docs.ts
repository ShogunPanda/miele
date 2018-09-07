import { readFileSync } from 'fs'
import { MOVED_PERMANENTLY } from 'http-status-codes'
import { join } from 'path'
import { DecoratedReply, DecoratedRequest } from '..'
import { DecoratedFastify } from '../environment'
import { Route, SchemaBaseInfo, Spec } from '../spec'
import { createPlugin } from './utils'

export const docsPlugin = createPlugin(async function(instance: DecoratedFastify): Promise<void> {
  const routes: Array<Route> = []
  let spec: any = null

  // Utility to track all the routes we add
  instance.addHook('onRoute', (routeOptions: Route) => {
    routes.push(JSON.parse(JSON.stringify(routeOptions)))
  })

  // Utility method to generate documentation
  instance.decorate('generateDocumentation', function(
    info: SchemaBaseInfo,
    models: { [key: string]: object },
    addDefaultErrors: boolean = true
  ) {
    if (routes.length === 0) return

    const specBase = new Spec(info, addDefaultErrors)
    specBase.addRoutes(routes)
    specBase.addModels(models || {})
    spec = specBase.generate()
  })

  // Utility method to print all routes
  instance.decorate('printAllRoutes', function() {
    if (routes.length === 0) return

    routes.sort(
      (a: Route, b: Route) =>
        a.url !== b.url ? a.url.localeCompare(b.url) : (a.method as string).localeCompare(b.method as string)
    )

    const output = routes.map(
      route => `\t\x1b[32m${route.method}\x1b[0m\t${route.url.replace(/(?:\:[\w]+|\[\:\w+\])/g, '\x1b[34m$&\x1b[39m')}`
    )
    instance.log.info(`Available routes:\n${output.join('\n')}`)
  })

  // Serve the OpenAPI/Swagger JSON file
  instance.get('/:path(openapi.json|swagger.json)', { config: { hide: true } }, async () => spec)
})

export const docsBrowserPlugin = createPlugin(async function(instance: DecoratedFastify): Promise<void> {
  const swaggerUIRoot = require('swagger-ui-dist').getAbsoluteFSPath()
  const swaggerUIRootIndex = readFileSync(
    join(require('swagger-ui-dist').getAbsoluteFSPath(), 'index.html'),
    'utf8'
  ).replace(/url: "(.*)"/, 'url: "/openapi.json"')

  // Add the Swagger UI
  instance.get('/docs', { config: { hide: true } }, (_r: DecoratedRequest, reply: DecoratedReply) => {
    reply.redirect(MOVED_PERMANENTLY, '/docs/')
  })

  instance.register(require('fastify-static'), { root: swaggerUIRoot, prefix: '/docs/', config: { hide: true } })

  // This hook is required because we have to serve the patched index file
  instance.addHook('preHandler', async (request: DecoratedRequest, reply: DecoratedReply) => {
    if (request.req.url!.match(/^(?:\/docs\/(?:index\.html)?)$/)) {
      reply.header('Content-Type', 'text/html; charset=UTF-8')
      reply.send(swaggerUIRootIndex)
    }
  })
})
