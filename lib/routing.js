"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const favo_1 = require("@cowtech/favo");
const ajv_1 = __importDefault(require("ajv"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
// @ts-ignore
const glob_1 = require("glob");
async function loadRoutes(instance, { routesFolder }) {
    // Maintain a list of custom validators defined in the routes
    const customFormats = {};
    for (const file of glob_1.sync(`${routesFolder}/**/*(*.ts|*.js)`)) {
        const required = require(file);
        const routes = (required.routes || [required.route]).filter((r) => r);
        for (const route of routes) {
            if (!route.config) {
                route.config = {};
            }
            // First of all, if the route has custom models defined, prepare for inclusion
            const models = favo_1.get(route, 'config.models', false);
            if (models) {
                const normalizedModels = {};
                const body = favo_1.get(route, 'schema.body');
                // Assign models
                for (const [name, definition] of Object.entries(models)) {
                    normalizedModels[`models.${name}`] = favo_1.omit(definition, ['description', 'ref']);
                }
                route.config.normalizedModels = normalizedModels;
                // Assign the normalizedModels to the body
                if (route.schema && body) {
                    /*
                      First of all, if the schema has a ref and it's also referenced inside the models,
                      make sure it's replace in order to avoid a circular JSON reference.
                    */
                    const baseName = (body.ref || '').replace(/^models\//, '');
                    if (baseName.length && models[baseName]) {
                        route.schema.body = {
                            $ref: `#/components/schemas/models.${baseName}`,
                            components: {
                                schemas: {}
                            }
                        };
                    }
                    const existingModels = favo_1.get(route, 'schema.body.components.schemas', {});
                    if (!route.schema.body.components) {
                        route.schema.body.components = {};
                    }
                    route.schema.body.components.schemas = Object.assign(Object.assign({}, existingModels), normalizedModels);
                }
            }
            if (customFormats) {
                Object.assign(customFormats, favo_1.get(route, 'config.customFormats'));
            }
            instance.route(route);
        }
    }
    // Override fastify schema compiler to add additional validations
    instance.setSchemaCompiler((schema) => {
        const compiler = new ajv_1.default({
            // The fastify defaults
            removeAdditional: false,
            useDefaults: true,
            coerceTypes: true,
            allErrors: true,
            unknownFormats: true,
            // Add custom validation
            formats: customFormats
        });
        return compiler.compile(schema);
    });
}
exports.loadRoutes = loadRoutes;
exports.loadRoutesPlugin = fastify_plugin_1.default(loadRoutes, { name: 'miele-routing', dependencies: ['miele-docs'] });
