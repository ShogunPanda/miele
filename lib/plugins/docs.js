"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createPlugin = require("fastify-plugin");
const fs_1 = require("fs");
const http_status_codes_1 = require("http-status-codes");
const path_1 = require("path");
const spec_1 = require("../spec");
exports.docsPlugin = createPlugin(async function (instance) {
    const routes = [];
    let spec = null;
    // Utility to track all the routes we add
    instance.addHook('onRoute', (routeOptions) => {
        routes.push(JSON.parse(JSON.stringify(routeOptions)));
    });
    // Utility method to generate documentation
    instance.decorate('generateDocumentation', function (info, models, addDefaultErrors = true) {
        if (routes.length === 0)
            return;
        const specBase = new spec_1.Spec(info, addDefaultErrors);
        specBase.addRoutes(routes);
        specBase.addModels(models);
        spec = specBase.generate();
    });
    // Utility method to print all routes
    instance.decorate('printAllRoutes', function () {
        if (routes.length === 0)
            return;
        routes.sort((a, b) => a.url !== b.url ? a.url.localeCompare(b.url) : a.method.localeCompare(b.method));
        const output = routes.map(route => `\t\x1b[32m${route.method}\x1b[0m\t${route.url.replace(/(?:\:[\w]+|\[\:\w+\])/g, '\x1b[34m$&\x1b[39m')}`);
        instance.log.info(`Available routes:\n${output.join('\n')}`);
    });
    // Serve the OpenAPI/Swagger JSON file
    instance.get('/:path(openapi.json|swagger.json)', { config: { hide: true } }, async () => spec);
});
exports.docsBrowserPlugin = createPlugin(async function (instance) {
    const swaggerUIRoot = require('swagger-ui-dist').getAbsoluteFSPath();
    const swaggerUIRootIndex = fs_1.readFileSync(path_1.join(require('swagger-ui-dist').getAbsoluteFSPath(), 'index.html'), 'utf8').replace(/url: "(.*)"/, 'url: "/openapi.json"');
    // Add the Swagger UI
    instance.get('/docs', { config: { hide: true } }, (_r, reply) => {
        reply.redirect(http_status_codes_1.MOVED_PERMANENTLY, '/docs/');
    });
    instance.register(require('fastify-static'), { root: swaggerUIRoot, prefix: '/docs/', config: { hide: true } });
    // This hook is required because we have to serve the patched index file
    instance.addHook('preHandler', async (request, reply) => {
        if (request.req.url.match(/^(?:\/docs\/(?:index\.html)?)$/)) {
            reply.header('Content-Type', 'text/html; charset=UTF-8');
            reply.send(swaggerUIRootIndex);
        }
    });
});
