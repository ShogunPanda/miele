"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = __importDefault(require("ajv"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
// @ts-ignore
const glob_1 = require("glob");
const lodash_get_1 = __importDefault(require("lodash.get"));
const lodash_omit_1 = __importDefault(require("lodash.omit"));
const lodash_set_1 = __importDefault(require("lodash.set"));
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
                    lodash_set_1.default(route, 'schema.body.components.schemas', Object.assign(Object.assign({}, existingModels), normalizedModels));
                }
            }
            if (customFormats) {
                Object.assign(customFormats, lodash_get_1.default(route, 'config.customFormats'));
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
