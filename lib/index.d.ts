/// <reference types="node" />
import { BenchmarkedIncomingMessage } from '@cowtech/favo';
import fastify from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
import { GenerateDocumentationOptions } from './docs';
export interface DecoratedFastify<TConfiguration = any, TServer = {}, TRequest = BenchmarkedIncomingMessage, TResponse = ServerResponse> extends fastify.FastifyInstance<TServer, TRequest, TResponse> {
    environment: string;
    configuration: TConfiguration;
    generateDocumentation(options: GenerateDocumentationOptions): void;
    printAllRoutes(): void;
}
export interface DecoratedRequest<T = IncomingMessage> extends fastify.FastifyRequest<T> {
}
export interface DecoratedReply<T = {}> extends fastify.FastifyReply<T> {
}
export * from './docs';
export * from './headers';
export * from './responses';
export * from './utils';
export * from './validation';
