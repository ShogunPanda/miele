"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
async function addWebsocket(instance, { library }) {
    let ws = null;
    if (!library) {
        library = 'ws';
    }
    try {
        const Klass = require(library).Server;
        ws = new Klass({ server: instance.server });
    }
    catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            throw new Error(`In order to enable WebSocket support, please install the ${library} module.`);
        }
        throw e;
    }
    instance.decorate('ws', ws);
    instance.addHook('onClose', (_instance, done) => ws.close(done));
}
exports.addWebsocket = addWebsocket;
exports.addWebsocketPlugin = fastify_plugin_1.default(addWebsocket, { name: 'miele-ws' });
