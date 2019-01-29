/// <reference types="node" />
import { Route, SchemaBaseInfo } from '@cowtech/favo';
import { FastifyInstance, Plugin } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
import { Server } from 'https';
export declare function printRoutes(routes: Array<Route>): void;
export declare function addDocumentationUI(instance: FastifyInstance<Server>): void;
export declare const addDocumentationPlugin: Plugin<Server, IncomingMessage, ServerResponse, {
    spec?: SchemaBaseInfo | undefined;
    skipDefaultErrors?: boolean | undefined;
    printRoutes?: boolean | undefined;
    addUI?: boolean | undefined;
}>;
