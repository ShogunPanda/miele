/// <reference types="fastify" />
import * as Ajv from 'ajv';
import Boom from 'boom';
import { Schema } from '../spec';
export declare type validationFormatter = (...args: Array<any>) => string;
export declare const validationMessagesFormatter: {
    [key: string]: validationFormatter;
};
export declare const validationMessages: {
    [key: string]: string;
};
export declare function convertValidationErrors(data: Schema, validationErrors: Array<Ajv.ErrorObject>, prefix: string, stripPrefix?: RegExp): Boom;
export declare const customValidationPlugin: import("fastify").Plugin<{}, {}, {}, {}>;
