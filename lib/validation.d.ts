import fastify from 'fastify';
export declare type ValidationPlugin = fastify.Plugin<{}, {}, {}, {}> & {
    addFormats?: (formatters: CustomValidationFormatters, messages?: CustomValidationMessages) => void;
};
export interface CustomValidationFormatters {
    [key: string]: (raw: string) => boolean;
}
export declare type CustomValidationMessages = {
    [key: string]: string;
};
export declare const customValidationPlugin: ValidationPlugin;
