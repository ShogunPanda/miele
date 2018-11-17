"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const favo_1 = require("@cowtech/favo");
const boom_1 = require("boom");
const http_status_codes_1 = require("http-status-codes");
function clientError(reply, boom, message, data) {
    const error = boom(message, data);
    // This is needed in order not to treat 4xx errors as 5xx (which fastify will default to) and therefore logged as erorrs.
    reply.code(error.output.statusCode);
    return error;
}
exports.clientError = clientError;
function handleNotFoundError(_r, reply) {
    reply.code(http_status_codes_1.NOT_FOUND).send(boom_1.notFound('Not found.'));
}
exports.handleNotFoundError = handleNotFoundError;
function handleInternalError(error, req, reply) {
    const boom = error.isBoom
        ? error
        : favo_1.convertError({ body: req.body, query: req.query, params: req.params }, error);
    reply
        .code(boom.output.statusCode)
        .type('application/json')
        .headers(boom.output.headers)
        .send({ ...boom.output.payload, ...boom.data });
}
exports.handleInternalError = handleInternalError;
