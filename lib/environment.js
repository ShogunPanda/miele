"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExtendedError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
exports.ExtendedError = ExtendedError;
function quoteRegexp(raw) {
    return raw.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}
exports.quoteRegexp = quoteRegexp;
function niceJoin(array, lastSeparator = ' and ', separator = ', ') {
    switch (array.length) {
        case 0:
            return '';
        case 1:
            return array[0];
        case 2:
            return array.join(lastSeparator);
        default:
            return array.slice(0, array.length - 1).join(separator) + lastSeparator + array[array.length - 1];
    }
}
exports.niceJoin = niceJoin;
function clientError(reply, boom, message, data) {
    const error = boom(message, data);
    // This is needed in order not to treat 4xx errors as 5xx (which fastify will default to) and therefore logged as erorrs.
    reply.code(error.output.statusCode);
    return error;
}
exports.clientError = clientError;
