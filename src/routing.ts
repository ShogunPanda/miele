import { CustomValidationFormatters, Route, Schema } from '@cowtech/favo'
import { FastifyInstance } from 'fastify'
import plugin from 'fastify-plugin'
// @ts-ignore
import { sync as glob } from 'glob'
import { Server } from 'https'
import get from 'lodash.get'
import omit from 'lodash.omit'
import set from 'lodash.set'
import { createAjv, ensureResponsesSchemas, validateResponse } from './validation'

export async function loadRoutes(
  instance: FastifyInstance<Server>,
  { routesFolder, enableResponsesValidation }: { routesFolder: string; enableResponsesValidation?: boolean }
): Promise<void> {
  const customFormats: CustomValidationFormatters = {}

  for (const file of glob(`${routesFolder}/**/*(*.ts|*.js)`)) {
    const required = require(file)
    const routes: Array<Route> = (required.routes || [required.route]).filter((r: Route) => r)

    for (const route of routes) {
      if (!route.config) route.config = {}

      // First of all, if the route has custom models defined, prepare for inclusion
      const models = get(route, 'config.models', false)

      if (models) {
        const normalizedModels: { [key: string]: Schema } = {}
        const body = get(route, 'schema.body')

        // Assign models
        for (const [name, definition] of Object.entries(models)) {
          normalizedModels[`models.${name}`] = omit(definition, ['description', 'ref'])
        }

        route.config.normalizedModels = normalizedModels

        // Assign the normalizedModels to the body
        if (body) {
          /*
            First of all, if the schema has a ref and it's also referenced inside the models,
            make sure it's replace in order to avoid a circular JSON reference.
          */
          const baseName = (body.ref || '').replace(/^models\//, '')

          if (baseName.length && models[baseName]) {
            route.schema!.body = {
              $ref: `#/components/schemas/models.${baseName}`,
              components: {
                schemas: {}
              }
            }
          }

          const existingModels = get(route, 'schema.body.components.schemas', {})
          set(route, 'schema.body.components.schemas', { ...existingModels, ...normalizedModels })
        }
      }

      const routeCustomFormats = get(route, 'config.customFormats')

      if (enableResponsesValidation) ensureResponsesSchemas(route)
      if (customFormats) Object.assign(customFormats, routeCustomFormats)

      instance.route(route)
    }
  }

  // Override fastify schema compiler
  instance.setSchemaCompiler((schema: Schema) => createAjv(customFormats).compile(schema))

  if (enableResponsesValidation) instance.addHook('preSerialization', validateResponse)
}

export const loadRoutesPlugin = plugin(loadRoutes, { name: 'miele-routing', dependencies: ['miele-docs'] })
