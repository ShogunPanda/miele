import Boom from 'boom';
import { FastifyReply, FastifyRequest } from 'fastify';
export declare function handleNotFoundError<R, S>(_r: FastifyRequest<R>, reply: FastifyReply<S>): void;
export declare function handleErrors<R, S>(error: Error | Boom, req: FastifyRequest<R>, reply: FastifyReply<S>): void;
