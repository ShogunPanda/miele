import { convertValidationErrors, Route, Schema, validationMessages, validationMessagesFormatters } from '@cowtech/favo'
import Ajv from 'ajv'
import { internal } from 'boom'
import dayjs from 'dayjs'
import fastify from 'fastify'
import { ServerResponse } from 'http'
import { INTERNAL_SERVER_ERROR } from 'http-status-codes'
import get from 'lodash.get'
import omit from 'lodash.omit'
import { DecoratedFastify, DecoratedReply, DecoratedRequest } from './index'
import { createPlugin } from './utils'

export type ValidationPlugin = fastify.Plugin<{}, {}, {}, {}> & {
  addFormats?: (formatters: CustomValidationFormatters, messages?: CustomValidationMessages) => void
}

export interface CustomValidationFormatters {
  [key: string]: (raw: string) => boolean
}

export type CustomValidationMessages = { [key: string]: string }

export const customValidationPlugin = (function(): ValidationPlugin {
  const customFormats: { [key: string]: (raw: string) => boolean } = {}

  const plugin: ValidationPlugin = createPlugin(async function(instance: DecoratedFastify): Promise<void> {
    const ajv = new Ajv({
      // the fastify defaults
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: true,
      allErrors: true,
      unknownFormats: true,
      // Add custom validation
      formats: {
        'date-time'(raw: string): boolean {
          return dayjs(raw).isValid()
        },
        ...customFormats
      }
    })

    // Assign to Fastify
    instance.setSchemaCompiler(function(schema: Schema): Ajv.ValidateFunction {
      return ajv.compile(schema)
    })

    // Validate routes responses, only on in development
    if (instance.environment === 'development') {
      instance.addHook('onRoute', (routeOptions: Route) => {
        const responses: Schema | null = get(routeOptions, 'schema.response', null)

        if (responses) {
          routeOptions.config = routeOptions.config || {}
          routeOptions.config.responsesValidator = Object.entries(responses).reduce(
            (accu: Schema, [code, schema]: [string, any]) => {
              if (schema.raw || schema.empty) {
                accu[code.toString()] = () => true
                accu[code.toString()].raw = true
              } else {
                const components = get(schema, 'components')
                const body = omit(schema, 'components')

                accu[code.toString()] = ajv.compile({
                  type: 'object',
                  properties: { body },
                  components
                })
              }

              return accu
            },
            {}
          )
        }
      })

      instance.addHook(
        'onSend',
        async (_req: DecoratedRequest, reply: DecoratedReply<ServerResponse>, payload: string) => {
          // Do not re-validate the 500
          if (reply.res.statusCode === INTERNAL_SERVER_ERROR) return payload

          const responsesValidator: { [key: string]: Ajv.ValidateFunction & { raw?: boolean } } | null =
            reply.context.config.responsesValidator

          if (responsesValidator) {
            const code = reply.res.statusCode
            const validator = responsesValidator[code.toString()]

            // No validator found, it means the status code is invalid
            if (!validator) throw internal('', { message: validationMessagesFormatters.invalidResponseCode(code) })

            const data = { body: validator.raw ? payload : JSON.parse(payload) }
            const valid = validator(data)

            if (!valid) {
              throw internal('', {
                message: validationMessagesFormatters.invalidResponse(code),
                errors: convertValidationErrors(data, validator.errors!, 'response', /^body\./).data.errors
              })
            }
          }

          return payload
        }
      )
    }
  })

  plugin.addFormats = function(validators: CustomValidationFormatters, messages?: CustomValidationMessages): void {
    Object.assign(customFormats, validators)
    Object.assign(validationMessages, messages || {})
  }

  return plugin
})()
