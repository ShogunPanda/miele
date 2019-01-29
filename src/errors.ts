import { toBoomError } from '@cowtech/favo'
import Boom, { notFound } from 'boom'
import { FastifyReply, FastifyRequest } from 'fastify'
import { NOT_FOUND } from 'http-status-codes'

export function handleNotFoundError<R, S>(_r: FastifyRequest<R>, reply: FastifyReply<S>): void {
  reply.code(NOT_FOUND).send(notFound('Not found.'))
}

export function handleErrors<R, S>(error: Error | Boom, req: FastifyRequest<R>, reply: FastifyReply<S>): void {
  const boom = toBoomError(error, { body: req.body, query: req.query, params: req.params })

  reply
    .code(boom.output.statusCode)
    .type('application/json')
    .headers(boom.output.headers)
    .send({ ...boom.output.payload, ...boom.data })
}
