"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const favo_1 = require("@cowtech/favo");
const utils_1 = require("./utils");
exports.customHeadersPlugin = utils_1.createPlugin(async function (instance) {
    // Register request start time
    instance.addHook('onRequest', async (req) => {
        req.startTime = process.hrtime();
    });
    // Add custom headers
    instance.addHook('onSend', async (request, reply) => {
        const duration = favo_1.durationInMs(request.req.startTime);
        reply.header('CowTech-Response-Time', `${duration.toFixed(6)} ms`);
    });
});
