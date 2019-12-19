import { FastifyReply, FastifyRequest } from 'fastify'
import { IncomingMessage, ServerResponse } from 'http'

export type Request = FastifyRequest<IncomingMessage>
export type Reply<T = ServerResponse> = FastifyReply<T>
