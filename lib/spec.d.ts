/// <reference types="node" />
import fastify from 'fastify';
import { ServerResponse } from 'http';
import { DecoratedIncomingMessage } from './environment';
import { SecurityScheme } from './plugins/authentication';
export declare type Route<TServer = {}, TRequest = DecoratedIncomingMessage, TResponse = ServerResponse> = fastify.RouteOptions<TServer, TRequest, TResponse>;
export declare type Schema = {
    [key: string]: any;
};
interface Tag {
    name: string;
    description: string;
}
interface Server {
    url: string;
    description: string;
}
export interface SchemaBaseInfo {
    title?: string;
    description?: string;
    authorName?: string;
    authorUrl?: string;
    authorEmail?: string;
    license?: string;
    version?: string;
    tags?: Array<Tag>;
    servers: Array<Server>;
}
export declare function omitFromSchema(schema: Schema, ...properties: Array<string>): Schema;
export declare class Spec implements SchemaBaseInfo {
    title?: string;
    description?: string;
    authorName?: string;
    authorUrl?: string;
    authorEmail?: string;
    license?: string;
    version?: string;
    tags?: Array<Tag>;
    servers: Array<Server>;
    securitySchemes: Schema;
    models: Schema;
    parameters: Schema;
    responses: Schema;
    errors: Schema;
    paths: Schema;
    constructor({ title, description, authorName, authorUrl, authorEmail, license, version, servers, tags }: SchemaBaseInfo, skipDefaultErrors?: boolean);
    generate(): Schema;
    addModels(models: {
        [key: string]: Schema;
    }): void;
    addSecuritySchemes(schemes: {
        [key: string]: SecurityScheme;
    }): void;
    addRoutes(routes: Array<Route>): void;
    private parseSecurity;
    private parseParameters;
    private parsePayload;
    private parseResponses;
    private resolveReference;
    private generateSchemaObjects;
}
export {};
