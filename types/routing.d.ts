/// <reference types="node" />
import { FastifyInstance } from 'fastify';
import { Server } from 'https';
export interface CustomValidationFormatters {
    [key: string]: (raw: any) => boolean;
}
export declare function loadRoutes(instance: FastifyInstance<Server>, { routesFolder }: {
    routesFolder: string;
}): Promise<void>;
export declare const loadRoutesPlugin: (instance: FastifyInstance<Server, import("http").IncomingMessage, import("http").ServerResponse>, options: {
    routesFolder: string;
}, callback: (err?: import("fastify").FastifyError | undefined) => void) => void;
