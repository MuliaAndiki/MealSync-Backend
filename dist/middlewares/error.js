"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
function notFoundHandler(req, res, _next) {
    res.status(404).json({ status: 404, message: `Route ${req.method} ${req.originalUrl} not found` });
}
function errorHandler(err, _req, res, _next) {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    const details = process.env.NODE_ENV === "development" ? err.stack : undefined;
    res.status(status).json({ status, message, error: details });
}
