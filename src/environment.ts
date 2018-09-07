import { ErrorObject } from 'ajv'
import Boom from 'boom'
import * as fastify from 'fastify'
import { IncomingMessage, ServerResponse } from 'http'
import { SchemaBaseInfo } from './spec'

type BoomError<T> = (message?: string, data?: T) => Boom<T>

export class ExtendedError extends Error {
  code: string
  validation?: Array<ErrorObject>

  constructor(code: string, message?: string) {
    super(message)

    this.code = code
  }
}

export interface DecoratedFastify<
  TConfiguration = any,
  TServer = {},
  TRequest = DecoratedIncomingMessage,
  TResponse = ServerResponse
> extends fastify.FastifyInstance<TServer, TRequest, TResponse> {
  environment: string
  configuration: TConfiguration
  generateDocumentation(info: SchemaBaseInfo, models?: { [key: string]: object }, addDefaultErrors?: boolean): void
  printAllRoutes(): void
}

export interface DecoratedRequest<T = IncomingMessage> extends fastify.FastifyRequest<T> {}
export interface DecoratedReply<T = {}> extends fastify.FastifyReply<T> {}

export interface DecoratedIncomingMessage extends IncomingMessage {
  startTime: [number, number]
}

export function quoteRegexp(raw: string): string {
  return raw.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')
}

export function niceJoin(array: Array<string>, lastSeparator: string = ' and ', separator: string = ', '): string {
  switch (array.length) {
    case 0:
      return ''
    case 1:
      return array[0]
    case 2:
      return array.join(lastSeparator)
    default:
      return array.slice(0, array.length - 1).join(separator) + lastSeparator + array[array.length - 1]
  }
}

export function clientError<T = any>(reply: DecoratedReply, boom: BoomError<T>, message?: string, data?: T): Boom<T> {
  const error = boom(message, data)

  // This is needed in order not to treat 4xx errors as 5xx (which fastify will default to) and therefore logged as erorrs.
  reply.code(error.output.statusCode)
  return error
}
