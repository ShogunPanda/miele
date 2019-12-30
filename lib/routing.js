"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = __importDefault(require("ajv"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
// @ts-ignore
const glob_1 = require("glob");
function omit(source, ...properties) {
    // Deep clone the object
    const target = JSON.parse(JSON.stringify(source));
    for (const property of properties) {
        delete target[property];
    }
    return target;
}
async function loadRoutes(instance, { routesFolder }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
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
            const models = (_b = (_a = route.config) === null || _a === void 0 ? void 0 : _a.models, (_b !== null && _b !== void 0 ? _b : false));
            if (models) {
                const normalizedModels = {};
                const body = (_c = route.schema) === null || _c === void 0 ? void 0 : _c.body;
                // Assign models
                for (const [name, definition] of Object.entries(models)) {
                    normalizedModels[`models.${name}`] = omit(definition, 'description', 'ref');
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
                    const existingModels = (_f = (_e = (_d = route.schema.body) === null || _d === void 0 ? void 0 : _d.components) === null || _e === void 0 ? void 0 : _e.schemas, (_f !== null && _f !== void 0 ? _f : {}));
                    if (!route.schema.body.components) {
                        route.schema.body.components = {};
                    }
                    route.schema.body.components.schemas = Object.assign(Object.assign({}, existingModels), normalizedModels);
                }
            }
            if (customFormats) {
                Object.assign(customFormats, (_j = (_h = (_g = route) === null || _g === void 0 ? void 0 : _g.config) === null || _h === void 0 ? void 0 : _h.customFormats, (_j !== null && _j !== void 0 ? _j : {})));
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
