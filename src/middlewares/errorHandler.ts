import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { AppError } from "../utils/appError.js";
import { sendError } from "../utils/apiResponse.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return sendError(res, "Validation failed", 400, err.flatten());
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return sendError(res, "Database operation failed", 400, {
      code: err.code ,
      message: err.message,
    });
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  return sendError(res, "Internal server error", 500);
};
