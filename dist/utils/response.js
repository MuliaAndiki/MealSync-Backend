"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverError = exports.notFound = exports.forbidden = exports.unauthorized = exports.badRequest = exports.created = exports.ok = void 0;
const ok = (message, data) => ({
    status: 200,
    message,
    data: data ?? null,
});
exports.ok = ok;
const created = (message, data) => ({
    status: 201,
    message,
    data: data ?? null,
});
exports.created = created;
const badRequest = (message, error) => ({
    status: 400,
    message,
    error,
});
exports.badRequest = badRequest;
const unauthorized = (message = "Unauthorized") => ({
    status: 401,
    message,
});
exports.unauthorized = unauthorized;
const forbidden = (message = "Forbidden") => ({
    status: 403,
    message,
});
exports.forbidden = forbidden;
const notFound = (message = "Not Found") => ({
    status: 404,
    message,
});
exports.notFound = notFound;
const serverError = (message = "Internal Server Error", error) => ({
    status: 500,
    message,
    error,
});
exports.serverError = serverError;
