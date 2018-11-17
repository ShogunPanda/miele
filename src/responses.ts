import { BoomError, convertError, ExtendedError } from '@cowtech/favo'
import Boom, { notFound } from 'boom'
import { NOT_FOUND } from 'http-status-codes'
import { DecoratedReply, DecoratedRequest } from './index'

export function clientError<T = any>(reply: DecoratedReply, boom: BoomError<T>, message?: string, data?: T): Boom<T> {
  const error = boom(message, data)

  // This is needed in order not to treat 4xx errors as 5xx (which fastify will default to) and therefore logged as erorrs.
  reply.code(error.output.statusCode)
  return error
}

export function handleNotFoundError(_r: DecoratedRequest, reply: DecoratedReply) {
  reply.code(NOT_FOUND).send(notFound('Not found.'))
}

export function handleInternalError(error: Error | ExtendedError | Boom, req: DecoratedRequest, reply: DecoratedReply) {
  const boom = (error as Boom).isBoom
    ? (error as Boom)
    : convertError({ body: req.body, query: req.query, params: req.params }, error as ExtendedError)

  reply
    .code(boom.output.statusCode)
    .type('application/json')
    .headers(boom.output.headers)
    .send({ ...boom.output.payload, ...boom.data })
}
