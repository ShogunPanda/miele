import { NodeError } from '@cowtech/favo'
import { FastifyInstance } from 'fastify'
import plugin from 'fastify-plugin'
import { Server } from 'https'

export async function addWebsocket(instance: FastifyInstance<Server>, { library }: { library: string }): Promise<void> {
  if (!library) library = 'ws'
  let ws: any = null

  try {
    const Klass = require(library).Server
    ws = new Klass({ server: instance.server })
  } catch (e) {
    if ((e as NodeError).code === 'MODULE_NOT_FOUND')
      throw new Error(`In order to enable WebSocket support, please install the ${library} module.`)

    throw e
  }

  instance.decorate('ws', ws)
  instance.addHook('onClose', (_instance: FastifyInstance<Server>, done: () => void) => ws.close(done))
}

export const addWebsocketPlugin = plugin(addWebsocket, { name: 'miele-ws' })
