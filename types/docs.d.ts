/// <reference types="node" />
import { Route, SchemaBaseInfo } from '@cowtech/favo';
import { FastifyInstance } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
import { Server } from 'https';
export declare function printRoutes(routes: Array<Route>): void;
export declare function addDocumentationUI(instance: FastifyInstance<Server>): void;
export declare const addDocumentationPlugin: (instance: FastifyInstance<Server, IncomingMessage, ServerResponse>, options: {
    spec?: SchemaBaseInfo | undefined;
    skipDefaultErrors?: boolean | undefined;
    printRoutes?: boolean | undefined;
    addUI?: boolean | undefined;
}, callback: (err?: import("fastify").FastifyError | undefined) => void) => void;
