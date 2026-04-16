import { Response } from "express";

type Meta = Record<string, unknown>;

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
  meta?: Meta
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    meta: meta ?? null,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    details: details ?? null,
    timestamp: new Date().toISOString(),
  });
};
