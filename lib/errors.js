"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const favo_1 = require("@cowtech/favo");
const boom_1 = require("boom");
const http_status_codes_1 = require("http-status-codes");
function handleNotFoundError(_r, reply) {
    reply.code(http_status_codes_1.NOT_FOUND).send(boom_1.notFound('Not found.'));
}
exports.handleNotFoundError = handleNotFoundError;
function handleErrors(error, req, reply) {
    const boom = favo_1.toBoomError(error, { body: req.body, query: req.query, params: req.params });
    reply
        .code(boom.output.statusCode)
        .type('application/json')
        .headers(boom.output.headers)
        .send({ ...boom.output.payload, ...boom.data });
}
exports.handleErrors = handleErrors;
