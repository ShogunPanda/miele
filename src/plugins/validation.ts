import * as Ajv from 'ajv'
import Boom, { badData, internal } from 'boom'
import * as fastify from 'fastify'
import * as createPlugin from 'fastify-plugin'
import { ServerResponse } from 'http'
import { INTERNAL_SERVER_ERROR } from 'http-status-codes'
import { get, omit } from 'lodash'
import { DateTime } from 'luxon'
import { DecoratedReply, DecoratedRequest, niceJoin } from '../environment'
import { Route, Struct } from '../schema'

export type validationFormatter = (...args: Array<any>) => string

export const validationMessagesFormatter: { [key: string]: validationFormatter } = {
  minimum: (min: number) => `must be a number greater than or equal to ${min}`,
  maximum: (max: number) => `must be a number less than or equal to ${max}`,
  enum: (values: Array<string>) =>
    `must be one of the following values: ${niceJoin(values.map(f => `"${f}"`), ' or ')}`,
  invalidResponseCode: (code: number) => `This endpoint cannot respond with HTTP status ${code}.`,
  invalidResponse: (code: number) =>
    `The response returned from the endpoint violates its specification for the HTTP status ${code}`
}

export const validationMessages: { [key: string]: string } = {
  contentType: 'only JSON payloads are accepted. Please set the "Content-Type" header to be "application/json"',
  json: 'the body payload is not a valid JSON',
  missing: 'must be present',
  unknown: 'is not a valid attribute',
  emptyObject: 'cannot be a empty object',
  uuid: 'must be a valid GUID (UUID v4)',
  timestamp:
    'must be a valid UTC timestamp in the format YYYY-MM-DDTHH:MM:SS.ssssssZ (example: 2018-07-06T12:34:56.123456Z)',
  date: 'must be a valid RFC 3339 date (example: 2018-07-06)',
  hostname: 'must be a valid hostname',
  ip: 'must be a valid IPv4 or IPv6',
  integer: 'must be a valid integer number',
  number: 'must be a valid number',
  boolean: 'must be a valid boolean (true or false)',
  object: 'must be a object',
  array: 'must be an array',
  string: 'must be a string',
  presentString: 'must be a non empty string'
}

export function convertValidationErrors(
  validationErrors: Array<Ajv.ErrorObject>,
  prefix: string,
  stripPrefix?: RegExp
): Boom {
  const errors: { [key: string]: string } = {}

  console.log(validationErrors)
  for (const e of validationErrors) {
    // For each errorr
    let key = ''
    let message = ''

    // Depending on the type
    switch (e.keyword) {
      case 'required':
      case 'dependencies':
        key = (e.params as Ajv.RequiredParams).missingProperty
        message = validationMessages.missing
        break
      case 'additionalProperties':
        key = (e.params as Ajv.AdditionalPropertiesParams).additionalProperty

        message = validationMessages.unknown
        break
      case 'minProperties':
        message = validationMessages.emptyObject
        break
      case 'type':
        message = validationMessages[(e.params as Ajv.TypeParams).type]
        break
      case 'minimum':
        message = validationMessagesFormatter.minimum((e.params as Ajv.ComparisonParams).limit as number)
        break
      case 'maximum':
        message = validationMessagesFormatter.maximum((e.params as Ajv.ComparisonParams).limit as number)
        break
      case 'number':
        message = validationMessages.number
        break
      case 'enum':
        message = validationMessagesFormatter.enum((e.params as Ajv.EnumParams).allowedValues)
        break
      case 'pattern':
        key = e.dataPath.substring(1)
        const pattern = (e.params as Ajv.PatternParams).pattern

        if (pattern === '.+') {
          message = validationMessages.presentString
        } else if (key === 'fields') {
          const name = pattern.match(/^\^\(\?\<([a-zA-Z]+)\>.+/)![1]
          message = validationMessagesFormatter.fields(name)
        } else {
          message = e.message!.replace(/\(\?\:/g, '(')
        }

        break
      case 'format':
        key = e.dataPath.substring(1)
        let reason = (e.params as Ajv.FormatParams).format

        // Normalize the key
        if (reason === 'ipv4' || reason === 'ipv6') reason = 'ip'
        else if (reason === 'date-time') reason = 'timestamp'

        message = validationMessages[reason]

        break
    }

    if (message) {
      let property = Array.from(new Set([e.dataPath.substring(1), key].filter(p => p))).join('.')

      if (stripPrefix) property = property.replace(stripPrefix, '')

      errors[property] = message
    }
  }

  return badData('Bad input data.', { errors: prefix ? { [prefix]: errors } : errors })
}

export const customValidationPlugin = createPlugin(async function(
  instance: fastify.FastifyInstance<{}, {}, {}>
): Promise<void> {
  const ajv: any = new Ajv({
    // the fastify defaults
    removeAdditional: false,
    useDefaults: true,
    coerceTypes: true,
    allErrors: true,
    unknownFormats: true,
    // Add custom validation
    formats: {
      'date-time'(raw: string): boolean {
        const parsed = DateTime.fromISO(raw, { zone: 'utc' })

        return parsed.isValid
      }
    }
  })

  // Assign to Fastify
  instance.setSchemaCompiler(function(schema) {
    return ajv.compile(schema)
  })

  // Validate routes responses
  instance.addHook('onRoute', (routeOptions: Route) => {
    const responses: Struct | null = get(routeOptions, 'schema.response', null)

    if (responses) {
      routeOptions.config = routeOptions.config || {}
      routeOptions.config.responsesValidator = Object.entries(responses).reduce(
        (accu: Struct, [code, schema]: [string, any]) => {
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

  instance.addHook('onSend', async (_req: DecoratedRequest, reply: DecoratedReply<ServerResponse>, payload: any) => {
    // Do not re-validate the 500
    if (reply.res.statusCode === INTERNAL_SERVER_ERROR) return payload

    const responsesValidator: { [key: string]: Ajv.ValidateFunction & { raw?: boolean } } =
      reply.context.config.responsesValidator

    if (responsesValidator) {
      const code = reply.res.statusCode
      const validator = responsesValidator[code.toString()]

      // No validator found, it means the status code is invalid
      if (!validator) throw internal('', { message: validationMessagesFormatter.invalidResponseCode(code) })

      const valid = validator({ body: validator.raw ? payload : JSON.parse(payload) })

      if (!valid) {
        throw internal('', {
          message: validationMessagesFormatter.invalidResponse(code),
          errors: convertValidationErrors(validator.errors!, 'response', /^body\./).data.errors
        })
      }
    }

    return payload
  })
})
