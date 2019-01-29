/// <reference types="node" />
import { FastifyInstance } from 'fastify';
import { Server } from 'https';
export declare function addWebsocket(instance: FastifyInstance<Server>, { library }: {
    library: string;
}): Promise<void>;
export declare const addWebsocketPlugin: import("fastify").Plugin<Server, import("http").IncomingMessage, import("http").ServerResponse, {
    library: string;
}>;
