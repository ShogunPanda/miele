"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
// @ts-ignore
const glob_1 = require("glob");
const lodash_get_1 = __importDefault(require("lodash.get"));
const lodash_omit_1 = __importDefault(require("lodash.omit"));
const lodash_set_1 = __importDefault(require("lodash.set"));
const validation_1 = require("./validation");
async function loadRoutes(instance, { routesFolder, enableResponsesValidation }) {
    const customFormats = {};
    for (const file of glob_1.sync(`${routesFolder}/**/*(*.ts|*.js)`)) {
        const required = require(file);
        const routes = (required.routes || [required.route]).filter((r) => r);
        for (const route of routes) {
            if (!route.config) {
                route.config = {};
            }
            // First of all, if the route has custom models defined, prepare for inclusion
            const models = lodash_get_1.default(route, 'config.models', false);
            if (models) {
                const normalizedModels = {};
                const body = lodash_get_1.default(route, 'schema.body');
                // Assign models
                for (const [name, definition] of Object.entries(models)) {
                    normalizedModels[`models.${name}`] = lodash_omit_1.default(definition, ['description', 'ref']);
                }
                route.config.normalizedModels = normalizedModels;
                // Assign the normalizedModels to the body
                if (body) {
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
                    const existingModels = lodash_get_1.default(route, 'schema.body.components.schemas', {});
                    lodash_set_1.default(route, 'schema.body.components.schemas', { ...existingModels, ...normalizedModels });
                }
            }
            validation_1.ensureResponsesSchemas(route);
            if (customFormats) {
                Object.assign(customFormats, lodash_get_1.default(route, 'config.customFormats'));
            }
            instance.route(route);
        }
    }
    // Override fastify schema compiler
    instance.setSchemaCompiler((schema) => validation_1.createAjv(customFormats).compile(schema));
    if (enableResponsesValidation) {
        instance.addHook('preSerialization', validation_1.validateResponse);
    }
}
exports.loadRoutes = loadRoutes;
exports.loadRoutesPlugin = fastify_plugin_1.default(loadRoutes, { name: 'miele-routing', dependencies: ['miele-docs'] });
