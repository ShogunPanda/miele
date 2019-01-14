import { SchemaBaseInfo, SecurityScheme } from '@cowtech/favo';
import { Plugin } from 'fastify';
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
export declare const docsPlugin: Plugin<{}, {}, {}, {}>;
export declare const docsBrowserPlugin: Plugin<{}, {}, {}, {}>;
