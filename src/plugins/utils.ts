import { Plugin } from 'fastify'
import * as createPluginCore from 'fastify-plugin'
import { DecoratedFastify } from '../environment'

type PluginFunction = (instance: DecoratedFastify) => Promise<void>
type PluginType = Plugin<{}, {}, {}, {}>

export function createPlugin(plugin: PluginFunction): PluginType {
  return createPluginCore(plugin as any)
}
