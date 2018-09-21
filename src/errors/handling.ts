import Boom, { badRequest, internal, notFound } from 'boom'
import { NOT_FOUND } from 'http-status-codes'
import { DecoratedReply, DecoratedRequest, ExtendedError } from '../environment'
import { convertValidationErrors, validationMessages } from '../plugins/validation'

function convertError(error: ExtendedError): Boom {
  const stack = serializeErrorStack(error)
  stack.shift()

  console.log(error)

  if (error.validation) {
    const prefix = error.message.split(/[\.\s]/).shift()
    return convertValidationErrors({}, error.validation, prefix!)
  } else if (error.code === 'INVALID_CONTENT_TYPE') return badRequest(validationMessages.contentType)
  else if (error.code === 'MALFORMED_JSON' || (stack[0] || '').startsWith('JSON.parse')) {
    return badRequest(validationMessages.json)
  }

  // Message must be passed as data otherwise Boom will hide it
  return internal('', { message: serializeErrorDescription(error), stack })
}

export function serializeErrorDescription(error: ExtendedError): string {
  return `[${error.code || error.name}] ${error.message}`
}

export function serializeErrorStack(error: Error): Array<string> {
  const cwd = process.cwd()
  if (!error.stack) return []

  return error.stack.split('\n').map(s =>
    s
      .trim()
      .replace(/^at /, '')
      .replace(cwd, '$ROOT')
  )
}

export function handleNotFoundError(_r: DecoratedRequest, reply: DecoratedReply) {
  reply.code(NOT_FOUND).send(notFound('Not found.'))
}

export function handleInternalError(error: Error | ExtendedError | Boom, _r: DecoratedRequest, reply: DecoratedReply) {
  const boom = (error as Boom).isBoom ? (error as Boom) : convertError(error as ExtendedError)

  reply
    .code(boom.output.statusCode)
    .type('application/json')
    .headers(boom.output.headers)
    .send({ ...boom.output.payload, ...boom.data })
}
