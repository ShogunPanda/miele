/// <reference types="node" />
import { FastifyInstance } from 'fastify';
import { Server } from 'https';
export declare function addCustomHeaders(instance: FastifyInstance<Server>): Promise<void>;
export declare const addCustomHeadersPlugin: import("fastify").Plugin<Server, import("http").IncomingMessage, import("http").ServerResponse, {}>;
