"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const favo_1 = require("@cowtech/favo");
const ajv_1 = __importDefault(require("ajv"));
const boom_1 = require("boom");
const http_status_codes_1 = require("http-status-codes");
const lodash_get_1 = __importDefault(require("lodash.get"));
const lodash_omit_1 = __importDefault(require("lodash.omit"));
const lodash_set_1 = __importDefault(require("lodash.set"));
exports.compiledSchemas = new Map();
function createAjv(customFormats) {
    return new ajv_1.default({
        // The fastify defaults
        removeAdditional: false,
        useDefaults: true,
        coerceTypes: true,
        allErrors: true,
        unknownFormats: true,
        // Add custom validation
        formats: customFormats
    });
}
exports.createAjv = createAjv;
async function validateResponse(_req, reply, payload) {
    const responsesValidators = reply.context.config.responsesValidators;
    // Do not re-validate the 500
    if (responsesValidators && reply.res.statusCode !== http_status_codes_1.INTERNAL_SERVER_ERROR) {
        const code = reply.res.statusCode;
        const validator = responsesValidators[code.toString()];
        // No validator found, it means the status code is invalid
        if (!validator) {
            throw boom_1.internal('', { message: favo_1.validationMessagesFormatters.invalidResponseCode(code) });
        }
        const valid = validator(payload);
        if (!valid) {
            throw boom_1.internal('', {
                message: favo_1.validationMessagesFormatters.invalidResponse(code),
                errors: favo_1.convertValidationErrors(payload, validator.errors, 'response', /^body\./).data.errors
            });
        }
    }
    return payload;
}
exports.validateResponse = validateResponse;
function ensureResponsesSchemas(route) {
    const responses = lodash_get_1.default(route, 'schema.response', null);
    if (!responses) {
        return;
    }
    const routeCustomFormats = lodash_get_1.default(route, 'config.customFormats');
    route.config = route.config || {};
    route.config.responsesValidators = Object.entries(responses).reduce((accu, [code, schema]) => {
        const cachedValidation = exports.compiledSchemas.get(schema);
        if (cachedValidation) {
            accu[code.toString()] = cachedValidation;
            return accu;
        }
        if (schema.raw || schema.empty) {
            accu[code.toString()] = () => true;
            accu[code.toString()].raw = true;
        }
        else {
            // Add route models to the schema components
            const models = lodash_get_1.default(route, 'config.models', false);
            if (models) {
                const baseName = (schema.ref || '').replace(/^models\//, '');
                if (baseName.length && models[baseName]) {
                    /*
                      First of all, if the schema has a ref and it's also referenced inside the models,
                      make sure it's replace in order to avoid a circular JSON reference.
                    */
                    schema = {
                        $ref: `#/components/schemas/models.${baseName}`,
                        components: {
                            schemas: {}
                        }
                    };
                }
                // Make sure schemas hierarchy exists
                lodash_set_1.default(schema, 'components.schemas', lodash_get_1.default(schema, 'components.schemas', {}));
                // Assign models
                for (const [name, definition] of Object.entries(models)) {
                    schema.components.schemas[`models.${name}`] = lodash_omit_1.default(definition, ['description', 'ref']);
                }
            }
            const compiled = createAjv(routeCustomFormats).compile(lodash_omit_1.default(schema, 'description', 'ref'));
            accu[code.toString()] = compiled;
            exports.compiledSchemas.set(schema, compiled);
        }
        return accu;
    }, {});
}
exports.ensureResponsesSchemas = ensureResponsesSchemas;
