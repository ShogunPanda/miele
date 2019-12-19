/// <reference types="node" />
import { FastifyReply, FastifyRequest } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
export declare type Request = FastifyRequest<IncomingMessage>;
export declare type Reply<T = ServerResponse> = FastifyReply<T>;
