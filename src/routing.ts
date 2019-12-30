import { Route, Schema } from '@cowtech/favo'
import Ajv from 'ajv'
import { FastifyInstance } from 'fastify'
import plugin from 'fastify-plugin'
// @ts-ignore
import { sync as glob } from 'glob'
import { Server } from 'https'

export interface CustomValidationFormatters {
  [key: string]: (raw: any) => boolean
}

function omit(source: object, ...properties: Array<string>): object {
  // Deep clone the object
  const target = JSON.parse(JSON.stringify(source))

  for (const property of properties) {
    delete target[property]
  }

  return target
}

export async function loadRoutes(
  instance: FastifyInstance<Server>,
  { routesFolder }: { routesFolder: string }
): Promise<void> {
  // Maintain a list of custom validators defined in the routes
  const customFormats: CustomValidationFormatters = {}

  for (const file of glob(`${routesFolder}/**/*(*.ts|*.js)`)) {
    const required = require(file)
    const routes: Array<Route> = (required.routes || [required.route]).filter((r: Route) => r)

    for (const route of routes) {
      if (!route.config) {
        route.config = {}
      }

      // First of all, if the route has custom models defined, prepare for inclusion
      const models = (route.config?.models as { [key: string]: Schema }) ?? false

      if (models) {
        const normalizedModels: { [key: string]: Schema } = {}
        const body = route.schema?.body as Schema

        // Assign models
        for (const [name, definition] of Object.entries(models)) {
          normalizedModels[`models.${name}`] = omit(definition, 'description', 'ref')
        }

        route.config.normalizedModels = normalizedModels

        // Assign the normalizedModels to the body
        if (route.schema && body) {
          /*
            First of all, if the schema has a ref and it's also referenced inside the models,
            make sure it's replace in order to avoid a circular JSON reference.
          */
          const baseName = (body.ref || '').replace(/^models\//, '')

          if (baseName.length && models[baseName]) {
            route.schema.body = {
              $ref: `#/components/schemas/models.${baseName}`,
              components: {
                schemas: {}
              }
            }
          }

          const existingModels = route.schema.body?.components?.schemas ?? {}

          if (!route.schema.body.components) {
            route.schema.body.components = {}
          }

          route.schema.body.components.schemas = { ...existingModels, ...normalizedModels }
        }
      }

      if (customFormats) {
        Object.assign(customFormats, route?.config?.customFormats ?? {})
      }

      instance.route(route)
    }
  }

  // Override fastify schema compiler to add additional validations
  instance.setSchemaCompiler((schema: Schema) => {
    const compiler = new Ajv({
      // The fastify defaults
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: true,
      allErrors: true,
      unknownFormats: true,
      // Add custom validation
      formats: customFormats
    })

    return compiler.compile(schema)
  })
}

export const loadRoutesPlugin = plugin(loadRoutes, { name: 'miele-routing', dependencies: ['miele-docs'] })
