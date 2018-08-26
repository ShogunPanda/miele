"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const enumeration_1 = require("./errors/enumeration");
const parametersSections = {
    headers: 'header',
    params: 'path',
    querystring: 'query'
};
class Schema {
    constructor({ title, description, authorName, authorUrl, authorEmail, license, version, servers, tags }, addDefaultErrors = true) {
        if (!license)
            license = 'MIT';
        Object.assign(this, { title, description, authorName, authorUrl, authorEmail, license, version, servers, tags });
        this.paths = {};
        this.models = {};
        this.parameters = {};
        this.responses = {};
        this.errors = Object.values(addDefaultErrors ? enumeration_1.errors : {}).reduce((accu, e) => {
            accu[e.properties.statusCode.enum[0]] = lodash_1.omit(e, 'ref');
            return accu;
        }, {});
    }
    generate() {
        const { title, description, authorName, authorUrl, authorEmail, license, version, servers, tags, models, parameters, responses, errors, paths } = this;
        return {
            openapi: '3.0.1',
            info: {
                title,
                description,
                contact: {
                    name: authorName,
                    url: authorUrl,
                    email: authorEmail
                },
                license: {
                    name: license.toUpperCase(),
                    url: `https://choosealicense.com/licenses/${license.toLowerCase()}/`
                },
                version
            },
            servers,
            tags,
            components: {
                models,
                parameters,
                responses,
                errors
            },
            paths
        };
    }
    addRoutes(routes) {
        // Filter only routes who have API schema defined and not hidden
        const apiRoutes = routes
            .filter(r => {
            const schema = lodash_1.get(r, 'schema', {});
            const config = lodash_1.get(r, 'config', {});
            return !schema.hide && !config.hide;
        })
            .sort((a, b) => a.url.localeCompare(b.url));
        // For each route
        for (const route of apiRoutes) {
            const schema = lodash_1.get(route, 'schema', {});
            const config = lodash_1.get(route, 'config', {});
            // OpenAPI groups by path and then method
            const path = route.url.replace(/:([a-zA-Z]+)/g, '{$1}');
            if (!this.paths[path])
                this.paths[path] = {};
            // Add the route to the spec
            this.paths[path][route.method.toLowerCase()] = {
                summary: config.description,
                tags: config.tags,
                parameters: this.parseParameters(schema),
                requestBody: this.parsePayload(schema),
                responses: this.parseResponses(schema.response || {})
            };
        }
    }
    addModels(models) {
        for (const [name, schema] of Object.entries(models)) {
            this.models[(schema.ref || name).split('/').pop()] = lodash_1.omit(schema, 'ref');
        }
    }
    parseParameters(schema) {
        let params = [];
        // For each parameter section - Cannot destructure directly to 'in' since it's a reserved keyword
        for (const [section, where] of Object.entries(parametersSections)) {
            const specs = schema[section];
            // No spec defined, just ignore it
            if (typeof specs !== 'object') {
                continue;
            }
            // Get the list of required parameters
            const required = lodash_1.get(specs, 'required', []);
            // For each property
            for (const [name, spec] of Object.entries(lodash_1.get(specs, 'properties', {}))) {
                params.push({
                    name,
                    in: where,
                    description: spec.description || null,
                    required: required.includes(name),
                    schema: this.resolveReference(spec, 'description', 'components')
                });
            }
        }
        return params;
    }
    parsePayload(schema) {
        // No spec defined, just ignore it
        if (!schema || typeof schema.body !== 'object') {
            return null;
        }
        return {
            description: schema.body.description,
            required: true,
            content: {
                'application/json': {
                    schema: this.resolveReference(schema.body, 'description')
                }
            }
        };
    }
    parseResponses(responses) {
        const parsed = {};
        // For each response code
        for (const [code, originalResponse] of Object.entries(responses)) {
            const { description, raw, empty } = originalResponse;
            let spec = { description };
            // Special handling for raw responses
            if (raw) {
                spec.content = { [raw]: {} };
            }
            else if (!empty) {
                // Regular response
                spec.content = {
                    'application/json': {
                        schema: this.resolveReference(originalResponse, 'description', 'raw', 'empty', 'components')
                    }
                };
            }
            parsed[code] = spec;
        }
        return parsed;
    }
    resolveReference(schema, ...keysBlacklist) {
        if (schema.$ref || schema.ref) {
            let ref = schema.$ref || schema.ref;
            if (ref.indexOf('#/') === -1)
                ref = `#/components/${ref}`;
            return { $ref: ref };
        }
        return lodash_1.omit(schema, ['ref', '$ref'].concat(keysBlacklist));
    }
}
exports.Schema = Schema;
