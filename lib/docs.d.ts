/// <reference types="fastify" />
import { SchemaBaseInfo, SecurityScheme } from '@cowtech/favo';
export interface GenerateDocumentationOptions {
    info: SchemaBaseInfo;
    models?: {
        [key: string]: object;
    };
    securitySchemes?: {
        [key: string]: SecurityScheme;
    };
    skipDefaultErrors?: boolean;
}
export declare const docsPlugin: import("fastify").Plugin<{}, {}, {}, {}>;
export declare const docsBrowserPlugin: import("fastify").Plugin<{}, {}, {}, {}>;
