"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const validation_1 = require("../plugins/validation");
exports.errors = {
    badRequest: {
        type: 'object',
        ref: `errors/${http_status_codes_1.BAD_REQUEST}`,
        description: 'Error returned when the client payload is either invalid or malformed.',
        properties: {
            statusCode: { type: 'number', description: 'The error code', enum: [http_status_codes_1.BAD_REQUEST], example: http_status_codes_1.BAD_REQUEST },
            error: { type: 'string', description: 'The error title', enum: ['Bad Request'], example: 'Bad Request' },
            message: {
                type: 'string',
                description: 'The error message',
                pattern: '.+',
                example: validation_1.validationMessages.contentType
            }
        },
        required: ['statusCode', 'error', 'message'],
        additionalProperties: false
    },
    unauthorized: {
        type: 'object',
        ref: `errors/${http_status_codes_1.UNAUTHORIZED}`,
        description: 'Error returned when then user does not provide any authorization grant.',
        properties: {
            statusCode: { type: 'number', description: 'The error code', enum: [http_status_codes_1.UNAUTHORIZED], example: http_status_codes_1.UNAUTHORIZED },
            error: { type: 'string', description: 'The error title', enum: ['Unauthorized'], example: 'Unauthorized' },
            message: { type: 'string', description: 'The error message', pattern: '.+', example: 'Unauthorized.' }
        },
        required: ['statusCode', 'error', 'message'],
        additionalProperties: false
    },
    forbidden: {
        type: 'object',
        ref: `errors/${http_status_codes_1.FORBIDDEN}`,
        description: 'Error returned when then user is not authorized to access requested resource or resources.',
        properties: {
            statusCode: { type: 'number', description: 'The error code', enum: [http_status_codes_1.FORBIDDEN], example: http_status_codes_1.FORBIDDEN },
            error: { type: 'string', description: 'The error title', enum: ['Forbidden'], example: 'Forbidden' },
            message: { type: 'string', description: 'The error message', pattern: '.+', example: 'Forbidden.' }
        },
        required: ['statusCode', 'error', 'message'],
        additionalProperties: false
    },
    notFound: {
        type: 'object',
        ref: `errors/${http_status_codes_1.NOT_FOUND}`,
        description: 'Error returned when then requested resource or resources are not found.',
        properties: {
            statusCode: { type: 'number', description: 'The error code', enum: [http_status_codes_1.NOT_FOUND], example: http_status_codes_1.NOT_FOUND },
            error: { type: 'string', description: 'The error title', enum: ['Not Found'], example: 'Not Found' },
            message: { type: 'string', description: 'The error message', pattern: '.+', example: 'Not found.' }
        },
        required: ['statusCode', 'error', 'message'],
        additionalProperties: false
    },
    conflict: {
        type: 'object',
        ref: `errors/${http_status_codes_1.CONFLICT}`,
        description: 'Error returned when then requested resource already existss.',
        properties: {
            statusCode: { type: 'number', description: 'The error code', enum: [http_status_codes_1.CONFLICT], example: http_status_codes_1.CONFLICT },
            error: { type: 'string', description: 'The error title', enum: ['Conflict'], example: 'Conflict' },
            message: { type: 'string', description: 'The error message', pattern: '.+', example: 'Conflict.' }
        },
        required: ['statusCode', 'error', 'message'],
        additionalProperties: false
    },
    unprocessableEntity: {
        type: 'object',
        ref: `errors/${http_status_codes_1.UNPROCESSABLE_ENTITY}`,
        description: 'Error returned when the client payload is well formed but it also has some logical errors.',
        properties: {
            statusCode: {
                type: 'number',
                description: 'The error code',
                enum: [http_status_codes_1.UNPROCESSABLE_ENTITY],
                example: http_status_codes_1.UNPROCESSABLE_ENTITY
            },
            error: {
                type: 'string',
                description: 'The error title',
                enum: ['Unprocessable Entity'],
                example: 'Unprocessable Entity'
            },
            message: { type: 'string', description: 'The error message', pattern: '.+', example: 'Bad input data.' },
            errors: {
                type: 'object',
                additionalProperties: true
            }
        },
        required: ['statusCode', 'error', 'message', 'errors'],
        additionalProperties: false
    },
    internalServerError: {
        type: 'object',
        ref: `errors/${http_status_codes_1.INTERNAL_SERVER_ERROR}`,
        description: 'Error returned when a unexpected error was thrown by the server.',
        properties: {
            statusCode: {
                type: 'number',
                description: 'The error code',
                enum: [http_status_codes_1.INTERNAL_SERVER_ERROR],
                example: http_status_codes_1.INTERNAL_SERVER_ERROR
            },
            error: {
                type: 'string',
                description: 'The error title',
                enum: ['Internal Server Error'],
                example: 'Internal Server Error'
            },
            message: { type: 'string', description: 'The error message', pattern: '.+', example: 'Server error.' },
            stack: { type: 'array', items: { type: 'string' } },
            errors: {
                type: 'object',
                additionalProperties: true
            }
        },
        required: ['statusCode', 'error', 'message'],
        additionalProperties: false
    },
    gatewayError: {
        type: 'object',
        ref: `errors/${http_status_codes_1.BAD_GATEWAY}`,
        description: 'Error returned when a unexpected error was thrown by a upstream server.',
        properties: {
            statusCode: {
                type: 'number',
                description: 'The error code',
                enum: [http_status_codes_1.BAD_GATEWAY],
                example: http_status_codes_1.BAD_GATEWAY
            },
            error: {
                type: 'string',
                description: 'The error title',
                enum: ['Bad Gateway'],
                example: 'Bad Gateway'
            },
            message: { type: 'string', description: 'The error message', pattern: '.+', example: 'Upstream error.' }
        },
        required: ['statusCode', 'error', 'message'],
        additionalProperties: false
    }
};
