"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const favo_1 = require("@cowtech/favo");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
async function addCustomHeaders(instance) {
    instance.decorateReply('startTime', []);
    instance.addHook('onRequest', async (_req, reply) => {
        const decorated = reply;
        decorated.startTime = process.hrtime();
    });
    instance.addHook('onSend', async (req, reply) => {
        reply.header('CowTech-Response-Id', req.id);
        reply.header('CowTech-Response-Time', `${favo_1.durationInMs(reply.startTime).toFixed(6)} ms`);
    });
}
exports.addCustomHeaders = addCustomHeaders;
exports.addCustomHeadersPlugin = fastify_plugin_1.default(addCustomHeaders, { name: 'miele-headers' });
