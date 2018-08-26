import * as fastify from 'fastify';
export declare type Route = fastify.RouteOptions<{}, {}, {}>;
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
export declare function omitFromSchemaDefinition(schema: Schema, ...properties: Array<string>): Schema;
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
    models: Schema;
    parameters: Schema;
    responses: Schema;
    errors: Schema;
    paths: Schema;
    constructor({ title, description, authorName, authorUrl, authorEmail, license, version, servers, tags }: SchemaBaseInfo, addDefaultErrors?: boolean);
    generate(): Schema;
    addRoutes(routes: Array<Route>): void;
    addModels(models: {
        [key: string]: any;
    }): void;
    parseParameters(schema: any): Schema;
    parsePayload(schema: any): Schema | null;
    private parseResponses;
    private resolveReference;
}
export {};
