import { NextFunction, Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({ status: 404, message: `Route ${req.method} ${req.originalUrl} not found` });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const details = process.env.NODE_ENV === "development" ? err.stack : undefined;
  res.status(status).json({ status, message, error: details });
}
