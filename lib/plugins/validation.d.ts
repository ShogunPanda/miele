import * as Ajv from 'ajv';
import Boom from 'boom';
import * as fastify from 'fastify';
import { Schema } from '../spec';
export declare type ValidationPlugin = fastify.Plugin<{}, {}, {}, {}> & {
    addFormats?: (formatters: CustomValidationFormatters, messages?: CustomValidationMessages) => void;
};
export interface CustomValidationFormatters {
    [key: string]: (raw: string) => boolean;
}
export declare type CustomValidationMessages = {
    [key: string]: string;
};
export declare type validationFormatter = (...args: Array<any>) => string;
export declare const validationMessagesFormatter: {
    [key: string]: validationFormatter;
};
export declare const validationMessages: {
    [key: string]: string;
};
export declare function convertValidationErrors(data: Schema, validationErrors: Array<Ajv.ErrorObject>, prefix: string, stripPrefix?: RegExp): Boom;
export declare const customValidationPlugin: ValidationPlugin;
