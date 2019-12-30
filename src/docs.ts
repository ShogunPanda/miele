import { Route, Schema, SchemaBaseInfo, Spec } from '@cowtech/favo'
import { FastifyInstance, Plugin, RouteOptions } from 'fastify'
import plugin from 'fastify-plugin'
import { readFileSync } from 'fs'
import { IncomingMessage, ServerResponse } from 'http'
import { MOVED_PERMANENTLY } from 'http-status-codes'
import { Server } from 'https'
import { resolve } from 'path'
import { Reply, Request } from './models'

export function printRoutes(routes: Array<Route>): void {
  if (routes.length === 0) {
    return
  }

  routes = routes
    .filter((r: Route) => {
      const schema = (r.schema ?? {}) as Schema
      const config = (r.config ?? {}) as Schema

      return !schema.hide && !config.hide
    })
    .sort((a: Route, b: Route) =>
      a.url !== b.url ? a.url.localeCompare(b.url) : (a.method as string).localeCompare(b.method as string)
    )

  const methodMax = Math.max(...routes.map((r: Route) => r.method.length))
  const urlMax = Math.max(...routes.map((r: Route) => r.url.length))

  const output = routes.map((route: Route) => {
    const method = (route.method as string).padEnd(methodMax)
    const url = route.url.padEnd(urlMax).replace(/(?:\:[\w]+|\[\:\w+\])/g, '\x1b[34m$&\x1b[39m')

    return `﹒ \x1b[32m${method}\x1b[0m ${url} \x1b[37m${route?.config?.description ?? ''}\x1b[0m`
  })

  console.log(`Available routes:\n${output.join('\n')}`)
}

export function addDocumentationUI(instance: FastifyInstance<Server>): void {
  let swaggerUIRoot: string | null = null
  let staticPlugin: Plugin<Server, IncomingMessage, ServerResponse, any> | null = null

  try {
    swaggerUIRoot = require('swagger-ui-dist').getAbsoluteFSPath()
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND') {
      throw e
    }

    instance.log.warn(
      'In order to enable UI feature of @cowtech/miele addDocumentationPlugin, please install swagger-ui-dist.'
    )
  }

  try {
    staticPlugin = require('fastify-static')
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND') {
      throw e
    }

    instance.log.warn(
      'In order to enable UI feature of @cowtech/miele addDocumentationPlugin, please install fastify-static.'
    )
  }

  if (!swaggerUIRoot || !staticPlugin) {
    return
  }

  const swaggerUIRootIndex = readFileSync(resolve(swaggerUIRoot, 'index.html'), 'utf8').replace(
    /url: "(.*)"/,
    'url: "/openapi.json"'
  )

  // Add the Swagger UI
  instance.route({
    method: 'GET',
    url: '/docs',
    handler(_req: Request, reply: Reply): void {
      reply.redirect(MOVED_PERMANENTLY, '/docs/')
    },
    config: {
      description: 'Gets OpenAPI definition in a browseable format',
      hide: true
    }
  })

  instance.register(staticPlugin, {
    root: swaggerUIRoot,
    prefix: '/docs/',
    schemaHide: true
  })

  // This hook is required because we have to serve the patched index file
  instance.addHook('preHandler', async (request: Request, reply: Reply) => {
    if (request.req.url!.match(/^(?:\/docs\/(?:index\.html)?)$/)) {
      reply.header('Content-Type', 'text/html; charset=UTF-8')
      reply.send(swaggerUIRootIndex)
    }
  })
}

async function addDocumentation(
  instance: FastifyInstance<Server>,
  {
    spec,
    skipDefaultErrors,
    printRoutes: shouldPrintRoutes,
    addUI
  }: { spec?: SchemaBaseInfo; skipDefaultErrors?: boolean; printRoutes?: boolean; addUI?: boolean }
): Promise<void> {
  if (shouldPrintRoutes) {
    const routes: Array<Route> = []

    // Utility to track all the routes we add
    instance.addHook('onRoute', (route: RouteOptions<Server, IncomingMessage, ServerResponse>) => routes.push(route))

    instance.ready((err: Error) => {
      if (!err) {
        printRoutes(routes)
      }
    })
  }

  // Setup OpenAPI
  if (spec) {
    const schema: Schema = new Spec(spec, skipDefaultErrors).generate()

    for (const url of ['/openapi.json', '/swagger.json']) {
      instance.route({
        method: 'GET',
        url,
        handler: async () => schema,
        config: { description: 'Gets OpenAPI definition' }
      })
    }

    if (addUI) {
      addDocumentationUI(instance)
    }
  }
}

export const addDocumentationPlugin = plugin(addDocumentation, { name: 'miele-docs' })
