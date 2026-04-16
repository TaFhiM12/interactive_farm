import { Request, Response } from "express";

import { sendError } from "../utils/apiResponse.js";

export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
};
