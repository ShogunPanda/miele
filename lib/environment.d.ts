/// <reference types="node" />
import { ErrorObject } from 'ajv';
import Boom from 'boom';
import fastify from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
import { GenerateDocumentationOptions } from './plugins/docs';
declare type BoomError<T> = (message?: string, data?: T) => Boom<T>;
export declare class ExtendedError extends Error {
    code: string;
    validation?: Array<ErrorObject>;
    constructor(code: string, message?: string);
}
export interface DecoratedFastify<TConfiguration = any, TServer = {}, TRequest = DecoratedIncomingMessage, TResponse = ServerResponse> extends fastify.FastifyInstance<TServer, TRequest, TResponse> {
    environment: string;
    configuration: TConfiguration;
    generateDocumentation(options: GenerateDocumentationOptions): void;
    printAllRoutes(): void;
}
export interface DecoratedRequest<T = IncomingMessage> extends fastify.FastifyRequest<T> {
}
export interface DecoratedReply<T = {}> extends fastify.FastifyReply<T> {
}
export interface DecoratedIncomingMessage extends IncomingMessage {
    startTime: [number, number];
}
export declare function quoteRegexp(raw: string): string;
export declare function niceJoin(array: Array<string>, lastSeparator?: string, separator?: string): string;
export declare function clientError<T = any>(reply: DecoratedReply, boom: BoomError<T>, message?: string, data?: T): Boom<T>;
export {};
