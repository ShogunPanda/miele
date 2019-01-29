/// <reference types="node" />
import { FastifyInstance } from 'fastify';
import { Server } from 'https';
export declare function loadRoutes(instance: FastifyInstance<Server>, { routesFolder, enableResponsesValidation }: {
    routesFolder: string;
    enableResponsesValidation?: boolean;
}): Promise<void>;
export declare const loadRoutesPlugin: import("fastify").Plugin<Server, import("http").IncomingMessage, import("http").ServerResponse, {
    routesFolder: string;
    enableResponsesValidation?: boolean | undefined;
}>;
