import {
  BAD_GATEWAY,
  BAD_REQUEST,
  CONFLICT,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY
} from 'http-status-codes'
import { validationMessages } from '../plugins/validation'
import { Schema } from '../spec'

export const errors: { [key: string]: Schema } = {
  badRequest: {
    type: 'object',
    ref: `errors/${BAD_REQUEST}`,
    description: 'Error returned when the client payload is either invalid or malformed.',
    properties: {
      statusCode: { type: 'number', description: 'The error code', enum: [BAD_REQUEST], example: BAD_REQUEST },
      error: { type: 'string', description: 'The error title', enum: ['Bad Request'], example: 'Bad Request' },
      message: {
        type: 'string',
        description: 'The error message',
        pattern: '.+',
        example: validationMessages.contentType
      }
    },
    required: ['statusCode', 'error', 'message'],
    additionalProperties: false
  },
  unauthorized: {
    type: 'object',
    ref: `errors/${UNAUTHORIZED}`,
    description: 'Error returned when then user does not provide any authorization grant.',
    properties: {
      statusCode: { type: 'number', description: 'The error code', enum: [UNAUTHORIZED], example: UNAUTHORIZED },
      error: { type: 'string', description: 'The error title', enum: ['Unauthorized'], example: 'Unauthorized' },
      message: { type: 'string', description: 'The error message', pattern: '.+', example: 'Unauthorized.' }
    },
    required: ['statusCode', 'error', 'message'],
    additionalProperties: false
  },
  forbidden: {
    type: 'object',
    ref: `errors/${FORBIDDEN}`,
    description: 'Error returned when then user is not authorized to access requested resource or resources.',
    properties: {
      statusCode: { type: 'number', description: 'The error code', enum: [FORBIDDEN], example: FORBIDDEN },
      error: { type: 'string', description: 'The error title', enum: ['Forbidden'], example: 'Forbidden' },
      message: { type: 'string', description: 'The error message', pattern: '.+', example: 'Forbidden.' }
    },
    required: ['statusCode', 'error', 'message'],
    additionalProperties: false
  },
  notFound: {
    type: 'object',
    ref: `errors/${NOT_FOUND}`,
    description: 'Error returned when then requested resource or resources are not found.',
    properties: {
      statusCode: { type: 'number', description: 'The error code', enum: [NOT_FOUND], example: NOT_FOUND },
      error: { type: 'string', description: 'The error title', enum: ['Not Found'], example: 'Not Found' },
      message: { type: 'string', description: 'The error message', pattern: '.+', example: 'Not found.' }
    },
    required: ['statusCode', 'error', 'message'],
    additionalProperties: false
  },
  conflict: {
    type: 'object',
    ref: `errors/${CONFLICT}`,
    description: 'Error returned when then requested resource already existss.',
    properties: {
      statusCode: { type: 'number', description: 'The error code', enum: [CONFLICT], example: CONFLICT },
      error: { type: 'string', description: 'The error title', enum: ['Not Found'], example: 'Conflict' },
      message: { type: 'string', description: 'The error message', pattern: '.+', example: 'Conflict.' }
    },
    required: ['statusCode', 'error', 'message'],
    additionalProperties: false
  },
  unprocessableEntity: {
    type: 'object',
    ref: `errors/${UNPROCESSABLE_ENTITY}`,
    description: 'Error returned when the client payload is well formed but it also has some logical errors.',
    properties: {
      statusCode: {
        type: 'number',
        description: 'The error code',
        enum: [UNPROCESSABLE_ENTITY],
        example: UNPROCESSABLE_ENTITY
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
    ref: `errors/${INTERNAL_SERVER_ERROR}`,
    description: 'Error returned when a unexpected error was thrown by the server.',
    properties: {
      statusCode: {
        type: 'number',
        description: 'The error code',
        enum: [INTERNAL_SERVER_ERROR],
        example: INTERNAL_SERVER_ERROR
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
    ref: `errors/${BAD_GATEWAY}`,
    description: 'Error returned when a unexpected error was thrown by a upstream server.',
    properties: {
      statusCode: {
        type: 'number',
        description: 'The error code',
        enum: [BAD_GATEWAY],
        example: BAD_GATEWAY
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
}
