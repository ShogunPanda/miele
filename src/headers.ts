import { durationInMs } from '@cowtech/favo'
import { FastifyInstance } from 'fastify'
import plugin from 'fastify-plugin'
import { Server } from 'https'
import { DecoratedReply, Reply, Request } from './models'

export async function addCustomHeaders(instance: FastifyInstance<Server>): Promise<void> {
  instance.decorateReply('startTime', [])

  instance.addHook('onRequest', async (_req: Request, reply: Reply) => {
    const decorated = reply as DecoratedReply
    decorated.startTime = process.hrtime()
  })

  instance.addHook('onSend', async (req: Request, reply: Reply) => {
    reply.header('CowTech-Response-Id', req.id)
    reply.header('CowTech-Response-Time', `${durationInMs((reply as DecoratedReply).startTime).toFixed(6)} ms`)
  })
}

export const addCustomHeadersPlugin = plugin(addCustomHeaders, { name: 'miele-headers' })
