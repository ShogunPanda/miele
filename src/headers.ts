import { BenchmarkedIncomingMessage, durationInMs } from '@cowtech/favo'
import fastify from 'fastify'
import { DecoratedFastify } from './index'
import { createPlugin } from './utils'

export const customHeadersPlugin = createPlugin(async function(instance: DecoratedFastify): Promise<void> {
  // Register request start time
  instance.addHook('onRequest', async (req: BenchmarkedIncomingMessage) => {
    req.startTime = process.hrtime()
  })

  // Add custom headers
  instance.addHook('onSend', async (request: fastify.FastifyRequest<{}>, reply: fastify.FastifyReply<{}>) => {
    const duration = durationInMs((request.req as BenchmarkedIncomingMessage).startTime)

    reply.header('CowTech-Response-Time', `${duration.toFixed(6)} ms`)
  })
})
