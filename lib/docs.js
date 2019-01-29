"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const favo_1 = require("@cowtech/favo");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const fs_1 = require("fs");
const http_status_codes_1 = require("http-status-codes");
const lodash_get_1 = __importDefault(require("lodash.get"));
const path_1 = require("path");
function printRoutes(routes) {
    if (routes.length === 0)
        return;
    routes = routes
        .filter((r) => !lodash_get_1.default(r, 'config.hide', false) && !lodash_get_1.default(r, 'schema.hide', false))
        .sort((a, b) => a.url !== b.url ? a.url.localeCompare(b.url) : a.method.localeCompare(b.method));
    const methodMax = Math.max(...routes.map((r) => r.method.length));
    const urlMax = Math.max(...routes.map((r) => r.url.length));
    const output = routes.map((route) => {
        const method = route.method.padEnd(methodMax);
        const url = route.url.padEnd(urlMax).replace(/(?:\:[\w]+|\[\:\w+\])/g, '\x1b[34m$&\x1b[39m');
        return `﹒ \x1b[32m${method}\x1b[0m ${url} \x1b[37m${lodash_get_1.default(route, 'config.description', '')}\x1b[0m`;
    });
    console.log(`Available routes:\n${output.join('\n')}`);
}
exports.printRoutes = printRoutes;
function addDocumentationUI(instance) {
    let swaggerUIRoot = null;
    let staticPlugin = null;
    try {
        swaggerUIRoot = require('swagger-ui-dist').getAbsoluteFSPath();
    }
    catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND')
            throw e;
        instance.log.warn('In order to enable UI feature of @cowtech/miele addDocumentationPlugin, please install swagger-ui-dist.');
    }
    try {
        staticPlugin = require('fastify-static');
    }
    catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND')
            throw e;
        instance.log.warn('In order to enable UI feature of @cowtech/miele addDocumentationPlugin, please install fastify-static.');
    }
    if (!swaggerUIRoot || !staticPlugin)
        return;
    const swaggerUIRootIndex = fs_1.readFileSync(path_1.resolve(swaggerUIRoot, 'index.html'), 'utf8').replace(/url: "(.*)"/, 'url: "/openapi.json"');
    // Add the Swagger UI
    instance.route({
        method: 'GET',
        url: '/docs',
        handler(_req, reply) {
            reply.redirect(http_status_codes_1.MOVED_PERMANENTLY, '/docs/');
        },
        config: {
            description: 'Gets OpenAPI definition in a browseable format',
            hide: true
        }
    });
    instance.register(staticPlugin, {
        root: swaggerUIRoot,
        prefix: '/docs/',
        schemaHide: true
    });
    // This hook is required because we have to serve the patched index file
    instance.addHook('preHandler', async (request, reply) => {
        if (request.req.url.match(/^(?:\/docs\/(?:index\.html)?)$/)) {
            reply.header('Content-Type', 'text/html; charset=UTF-8');
            reply.send(swaggerUIRootIndex);
        }
    });
}
exports.addDocumentationUI = addDocumentationUI;
async function addDocumentation(instance, { spec, skipDefaultErrors, printRoutes: shouldPrintRoutes, addUI }) {
    if (shouldPrintRoutes) {
        const routes = [];
        // Utility to track all the routes we add
        instance.addHook('onRoute', (route) => routes.push(route));
        instance.ready((err) => {
            if (!err)
                printRoutes(routes);
        });
    }
    // Setup OpenAPI
    if (spec) {
        const schema = new favo_1.Spec(spec, skipDefaultErrors).generate();
        for (const url of ['/openapi.json', '/swagger.json']) {
            instance.route({
                method: 'GET',
                url,
                handler: async () => schema,
                config: { description: 'Gets OpenAPI definition' }
            });
        }
        if (addUI)
            addDocumentationUI(instance);
    }
}
exports.addDocumentationPlugin = fastify_plugin_1.default(addDocumentation, { name: 'miele-docs' });
