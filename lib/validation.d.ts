import { CustomValidationFormatters, Route, Schema } from '@cowtech/favo';
import Ajv from 'ajv';
import { Reply, Request } from './models';
export declare const compiledSchemas: Map<Schema, Ajv.ValidateFunction>;
export declare function createAjv(customFormats: CustomValidationFormatters): Ajv.Ajv;
export declare function validateResponse(_req: Request, reply: Reply, payload: any): Promise<any>;
export declare function ensureResponsesSchemas(route: Route): void;
