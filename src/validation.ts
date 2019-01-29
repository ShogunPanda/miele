import {
  convertValidationErrors,
  CustomValidationFormatters,
  Route,
  Schema,
  validationMessagesFormatters
} from '@cowtech/favo'
import Ajv from 'ajv'
import { internal } from 'boom'
import { INTERNAL_SERVER_ERROR } from 'http-status-codes'
import get from 'lodash.get'
import omit from 'lodash.omit'
import set from 'lodash.set'
import { Reply, Request } from './models'

export const compiledSchemas: Map<Schema, Ajv.ValidateFunction> = new Map<Schema, Ajv.ValidateFunction>()

export function createAjv(customFormats: CustomValidationFormatters): Ajv.Ajv {
  return new Ajv({
    // The fastify defaults
    removeAdditional: false,
    useDefaults: true,
    coerceTypes: true,
    allErrors: true,
    unknownFormats: true,
    // Add custom validation
    formats: customFormats
  })
}

export async function validateResponse(_req: Request, reply: Reply, payload: any): Promise<any> {
  const responsesValidators: { [key: string]: Ajv.ValidateFunction & { raw?: boolean } } | null =
    reply.context.config.responsesValidators

  // Do not re-validate the 500
  if (responsesValidators && reply.res.statusCode !== INTERNAL_SERVER_ERROR) {
    const code = reply.res.statusCode
    const validator = responsesValidators[code.toString()]

    // No validator found, it means the status code is invalid
    if (!validator) throw internal('', { message: validationMessagesFormatters.invalidResponseCode(code) })

    const valid = validator(payload)

    if (!valid) {
      throw internal('', {
        message: validationMessagesFormatters.invalidResponse(code),
        errors: convertValidationErrors(payload, validator.errors!, 'response', /^body\./).data.errors
      })
    }
  }

  return payload
}

export function ensureResponsesSchemas(route: Route): void {
  const responses: Schema | null = get(route, 'schema.response', null)
  if (!responses) return

  const routeCustomFormats = get(route, 'config.customFormats')

  route.config = route.config || {}
  route.config.responsesValidators = Object.entries(responses).reduce((accu: Schema, [code, schema]: [string, any]) => {
    const cachedValidation = compiledSchemas.get(schema)

    if (cachedValidation) {
      accu[code.toString()] = cachedValidation
      return accu
    }

    if (schema.raw || schema.empty) {
      accu[code.toString()] = () => true
      accu[code.toString()].raw = true
    } else {
      // Add route models to the schema components
      const models = get(route, 'config.models', false)

      if (models) {
        const baseName = (schema.ref || '').replace(/^models\//, '')
        if (baseName.length && models[baseName]) {
          /*
            First of all, if the schema has a ref and it's also referenced inside the models,
            make sure it's replace in order to avoid a circular JSON reference.
          */
          schema = {
            $ref: `#/components/schemas/models.${baseName}`,
            components: {
              schemas: {}
            }
          }
        }

        // Make sure schemas hierarchy exists
        set(schema, 'components.schemas', get(schema, 'components.schemas', {}))

        // Assign models
        for (const [name, definition] of Object.entries(models)) {
          schema.components.schemas[`models.${name}`] = omit(definition, ['description', 'ref'])
        }
      }

      const compiled = createAjv(routeCustomFormats).compile(omit(schema, 'description', 'ref'))
      accu[code.toString()] = compiled
      compiledSchemas.set(schema, compiled)
    }

    return accu
  }, {})
}
