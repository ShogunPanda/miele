"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const favo_1 = require("@cowtech/favo");
const ajv_1 = __importDefault(require("ajv"));
const boom_1 = require("boom");
const dayjs_1 = __importDefault(require("dayjs"));
const http_status_codes_1 = require("http-status-codes");
const lodash_get_1 = __importDefault(require("lodash.get"));
const lodash_omit_1 = __importDefault(require("lodash.omit"));
const utils_1 = require("./utils");
exports.customValidationPlugin = (function () {
    const customFormats = {};
    const plugin = utils_1.createPlugin(async function (instance) {
        const ajv = new ajv_1.default({
            // the fastify defaults
            removeAdditional: false,
            useDefaults: true,
            coerceTypes: true,
            allErrors: true,
            unknownFormats: true,
            // Add custom validation
            formats: {
                'date-time'(raw) {
                    return dayjs_1.default(raw).isValid();
                },
                ...customFormats
            }
        });
        // Assign to Fastify
        instance.setSchemaCompiler(function (schema) {
            return ajv.compile(schema);
        });
        // Validate routes responses, only on in development
        if (instance.environment === 'development') {
            instance.addHook('onRoute', (routeOptions) => {
                const responses = lodash_get_1.default(routeOptions, 'schema.response', null);
                if (responses) {
                    routeOptions.config = routeOptions.config || {};
                    routeOptions.config.responsesValidator = Object.entries(responses).reduce((accu, [code, schema]) => {
                        if (schema.raw || schema.empty) {
                            accu[code.toString()] = () => true;
                            accu[code.toString()].raw = true;
                        }
                        else {
                            const components = lodash_get_1.default(schema, 'components');
                            const body = lodash_omit_1.default(schema, 'components');
                            accu[code.toString()] = ajv.compile({
                                type: 'object',
                                properties: { body },
                                components
                            });
                        }
                        return accu;
                    }, {});
                }
            });
            instance.addHook('onSend', async (_req, reply, payload) => {
                // Do not re-validate the 500
                if (reply.res.statusCode === http_status_codes_1.INTERNAL_SERVER_ERROR)
                    return payload;
                const responsesValidator = reply.context.config.responsesValidator;
                if (responsesValidator) {
                    const code = reply.res.statusCode;
                    const validator = responsesValidator[code.toString()];
                    // No validator found, it means the status code is invalid
                    if (!validator)
                        throw boom_1.internal('', { message: favo_1.validationMessagesFormatters.invalidResponseCode(code) });
                    const data = { body: validator.raw ? payload : JSON.parse(payload) };
                    const valid = validator(data);
                    if (!valid) {
                        throw boom_1.internal('', {
                            message: favo_1.validationMessagesFormatters.invalidResponse(code),
                            errors: favo_1.convertValidationErrors(data, validator.errors, 'response', /^body\./).data.errors
                        });
                    }
                }
                return payload;
            });
        }
    });
    plugin.addFormats = function (validators, messages) {
        Object.assign(customFormats, validators);
        Object.assign(favo_1.validationMessages, messages || {});
    };
    return plugin;
})();
