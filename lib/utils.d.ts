import { Plugin } from 'fastify';
import { DecoratedFastify } from './index';
declare type PluginFunction = (instance: DecoratedFastify) => Promise<void>;
declare type PluginType = Plugin<{}, {}, {}, {}>;
export declare function createPlugin(plugin: PluginFunction): PluginType;
export {};
