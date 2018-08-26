import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, UNPROCESSABLE_ENTITY } from 'http-status-codes'
import { validationMessages } from '../plugins/validation'
import { Struct } from '../schema'

export const errors: { [key: string]: Struct } = {
  badRequest: {
    type: 'object',
    ref: `errors/${BAD_REQUEST}`,
    description: 'Error returned when the client payload is either invalid or malformed.',
    properties: {
      statusCode: { type: 'number', enum: [BAD_REQUEST], example: BAD_REQUEST },
      error: { type: 'string', enum: ['Bad Request'], example: 'Bad Request' },
      message: { type: 'string', pattern: '.+', example: validationMessages.contentType }
    },
    required: ['statusCode', 'error', 'message'],
    additionalProperties: false
  },
  notFound: {
    type: 'object',
    ref: `errors/${NOT_FOUND}`,
    description: 'Error returned when then requested resource or resources are not found.',
    properties: {
      statusCode: { type: 'number', enum: [NOT_FOUND], example: NOT_FOUND },
      error: { type: 'string', enum: ['Not Found'], example: 'Not Found' },
      message: { type: 'string', pattern: '.+', example: 'Not found' }
    },
    required: ['statusCode', 'error', 'message'],
    additionalProperties: false
  },
  unprocessableEntity: {
    type: 'object',
    ref: `errors/${UNPROCESSABLE_ENTITY}`,
    description: 'Error returned when the client payload is well formed but it also has some logical errors.',
    properties: {
      statusCode: { type: 'number', enum: [UNPROCESSABLE_ENTITY], example: UNPROCESSABLE_ENTITY },
      error: { type: 'string', enum: ['Unprocessable Entity'], example: 'Unprocessable Entity' },
      message: { type: 'string', pattern: '.+', example: 'Bad input data.' },
      errors: {
        type: 'object',
        additionalProperties: true,
        patternProperties: {
          '.+': { type: 'object', additionalProperties: true, patternProperties: { '.+': { type: 'string' } } }
        }
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
      statusCode: { type: 'number', enum: [INTERNAL_SERVER_ERROR], example: INTERNAL_SERVER_ERROR },
      error: { type: 'string', enum: ['Internal Server Error'], example: 'Internal Server Error' },
      message: { type: 'string' },
      stack: { type: 'array', items: { type: 'string' } },
      errors: {
        type: 'object',
        additionalProperties: true,
        patternProperties: {
          '.+': { type: 'object', additionalProperties: true, patternProperties: { '.+': { type: 'string' } } }
        }
      }
    },
    required: ['statusCode', 'error', 'message'],
    additionalProperties: false
  }
}
