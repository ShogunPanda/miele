import { Plugin } from 'fastify'
import createPluginCore from 'fastify-plugin'
import { DecoratedFastify } from './index'

type PluginFunction = (instance: DecoratedFastify) => Promise<void>
type PluginType = Plugin<{}, {}, {}, {}>

export function createPlugin(plugin: PluginFunction): PluginType {
  return createPluginCore(plugin as any)
}
