import * as fastify from 'fastify'
import * as createPlugin from 'fastify-plugin'
import { DecoratedIncomingMessage } from '../environment'

export function durationInMs(startTime: [number, number]): number {
  const hrDuration = process.hrtime(startTime)

  return hrDuration[0] * 1e3 + hrDuration[1] / 1e6
}

export const customHeadersPlugin = createPlugin(async function(
  instance: fastify.FastifyInstance<{}, {}, {}>
): Promise<void> {
  // Register request start time
  instance.addHook('onRequest', async (req: DecoratedIncomingMessage) => {
    req.startTime = process.hrtime()
  })

  // Add custom headers
  instance.addHook('onSend', async (request: fastify.FastifyRequest<{}>, reply: fastify.FastifyReply<{}>) => {
    const duration = durationInMs((request.req as DecoratedIncomingMessage).startTime)

    reply.header('CowTech-Response-Time', `${duration.toFixed(6)} ms`)
  })
})
