"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createPluginCore = require("fastify-plugin");
function createPlugin(plugin) {
    return createPluginCore(plugin);
}
exports.createPlugin = createPlugin;
