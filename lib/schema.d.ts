import * as fastify from 'fastify';
export declare type Route = fastify.RouteOptions<{}, {}, {}>;
export declare type Struct = {
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
export declare class Schema implements SchemaBaseInfo {
    title?: string;
    description?: string;
    authorName?: string;
    authorUrl?: string;
    authorEmail?: string;
    license?: string;
    version?: string;
    tags?: Array<Tag>;
    servers: Array<Server>;
    models: Struct;
    parameters: Struct;
    responses: Struct;
    errors: Struct;
    paths: Struct;
    constructor({ title, description, authorName, authorUrl, authorEmail, license, version, servers, tags }: SchemaBaseInfo, addDefaultErrors?: boolean);
    generate(): Struct;
    addRoutes(routes: Array<Route>): void;
    addModels(models: {
        [key: string]: any;
    }): void;
    parseParameters(schema: any): Struct;
    parsePayload(schema: any): Struct | null;
    private parseResponses;
    private resolveReference;
}
export {};
