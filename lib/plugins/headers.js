"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createPlugin = require("fastify-plugin");
function durationInMs(startTime) {
    const hrDuration = process.hrtime(startTime);
    return hrDuration[0] * 1e3 + hrDuration[1] / 1e6;
}
exports.durationInMs = durationInMs;
exports.customHeadersPlugin = createPlugin(async function (instance) {
    // Register request start time
    instance.addHook('onRequest', async (req) => {
        req.startTime = process.hrtime();
    });
    // Add custom headers
    instance.addHook('onSend', async (request, reply) => {
        const duration = durationInMs(request.req.startTime);
        reply.header('CowTech-Response-Time', `${duration.toFixed(6)} ms`);
    });
});
