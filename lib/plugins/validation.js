"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ajv = require("ajv");
const boom_1 = require("boom");
const http_status_codes_1 = require("http-status-codes");
const lodash_1 = require("lodash");
const luxon_1 = require("luxon");
const environment_1 = require("../environment");
const utils_1 = require("./utils");
exports.validationMessagesFormatter = {
    minimum: (min) => `must be a number greater than or equal to ${min}`,
    maximum: (max) => `must be a number less than or equal to ${max}`,
    enum: (values) => `must be one of the following values: ${environment_1.niceJoin(values.map(f => `"${f}"`), ' or ')}`,
    invalidResponseCode: (code) => `This endpoint cannot respond with HTTP status ${code}.`,
    invalidResponse: (code) => `The response returned from the endpoint violates its specification for the HTTP status ${code}`
};
exports.validationMessages = {
    contentType: 'only JSON payloads are accepted. Please set the "Content-Type" header to be "application/json"',
    json: 'the body payload is not a valid JSON',
    missing: 'must be present',
    unknown: 'is not a valid attribute',
    emptyObject: 'cannot be a empty object',
    uuid: 'must be a valid GUID (UUID v4)',
    timestamp: 'must be a valid UTC timestamp in the format YYYY-MM-DDTHH:MM:SS.ssssssZ (example: 2018-07-06T12:34:56.123456Z)',
    date: 'must be a valid RFC 3339 date (example: 2018-07-06)',
    hostname: 'must be a valid hostname',
    ip: 'must be a valid IPv4 or IPv6',
    integer: 'must be a valid integer number',
    number: 'must be a valid number',
    boolean: 'must be a valid boolean (true or false)',
    object: 'must be a object',
    array: 'must be an array',
    string: 'must be a string',
    presentString: 'must be a non empty string'
};
function convertValidationErrors(data, validationErrors, prefix, stripPrefix) {
    const errors = {};
    for (const e of validationErrors) {
        // For each error
        let section = prefix;
        let baseKey = e.dataPath.substring(e.dataPath.startsWith('.') ? 1 : 0);
        let key = baseKey;
        let message = '';
        if (section === 'querystring') {
            section = 'query';
        }
        const value = lodash_1.get(data, `${section}.${key}`);
        // Depending on the type
        switch (e.keyword) {
            case 'required':
            case 'dependencies':
                key = e.params.missingProperty;
                message = exports.validationMessages.missing;
                break;
            case 'additionalProperties':
                key = e.params.additionalProperty;
                message = exports.validationMessages.unknown;
                break;
            case 'minProperties':
                message = exports.validationMessages.emptyObject;
                break;
            case 'type':
                message = exports.validationMessages[e.params.type];
                break;
            case 'minimum':
                message = exports.validationMessagesFormatter.minimum(e.params.limit);
                break;
            case 'maximum':
                message = exports.validationMessagesFormatter.maximum(e.params.limit);
                break;
            case 'number':
                message = exports.validationMessages.number;
                break;
            case 'enum':
                message = exports.validationMessagesFormatter.enum(e.params.allowedValues);
                break;
            case 'pattern':
                const pattern = e.params.pattern;
                if (pattern === '.+' || (!value || !value.length)) {
                    message = exports.validationMessages.presentString;
                }
                else if (key === 'fields') {
                    const name = pattern.match(/^\^\(\?\<([a-zA-Z]+)\>.+/)[1];
                    message = exports.validationMessagesFormatter.fields(name);
                }
                else {
                    message = e.message.replace(/\(\?\:/g, '(');
                }
                break;
            case 'format':
                let reason = e.params.format;
                // Normalize the key
                if (reason === 'ipv4' || reason === 'ipv6')
                    reason = 'ip';
                else if (reason === 'date-time')
                    reason = 'timestamp';
                message = exports.validationMessages[reason];
                break;
        }
        if (message) {
            let property = Array.from(new Set([baseKey, key].filter(p => p)))
                .join('.')
                .replace(/[\[\]]/g, '');
            if (stripPrefix)
                property = property.replace(stripPrefix, '');
            errors[property] = message;
        }
    }
    return boom_1.badData('Bad input data.', { errors: prefix ? { [prefix]: errors } : errors });
}
exports.convertValidationErrors = convertValidationErrors;
exports.customValidationPlugin = utils_1.createPlugin(async function (instance) {
    const ajv = new Ajv({
        // the fastify defaults
        removeAdditional: false,
        useDefaults: true,
        coerceTypes: true,
        allErrors: true,
        unknownFormats: true,
        // Add custom validation
        formats: {
            'date-time'(raw) {
                const parsed = luxon_1.DateTime.fromISO(raw, { zone: 'utc' });
                return parsed.isValid;
            }
        }
    });
    // Assign to Fastify
    instance.setSchemaCompiler(function (schema) {
        return ajv.compile(schema);
    });
    // Validate routes responses
    instance.addHook('onRoute', (routeOptions) => {
        const responses = lodash_1.get(routeOptions, 'schema.response', null);
        if (responses) {
            routeOptions.config = routeOptions.config || {};
            routeOptions.config.responsesValidator = Object.entries(responses).reduce((accu, [code, schema]) => {
                if (schema.raw || schema.empty) {
                    accu[code.toString()] = () => true;
                    accu[code.toString()].raw = true;
                }
                else {
                    const components = lodash_1.get(schema, 'components');
                    const body = lodash_1.omit(schema, 'components');
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
                throw boom_1.internal('', { message: exports.validationMessagesFormatter.invalidResponseCode(code) });
            const data = { body: validator.raw ? payload : JSON.parse(payload) };
            const valid = validator(data);
            if (!valid) {
                throw boom_1.internal('', {
                    message: exports.validationMessagesFormatter.invalidResponse(code),
                    errors: convertValidationErrors(data, validator.errors, 'response', /^body\./).data.errors
                });
            }
        }
        return payload;
    });
});
