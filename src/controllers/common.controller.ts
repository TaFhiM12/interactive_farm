import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const notImplemented = (moduleName: string) =>
  asyncHandler(async (_req: Request, res: Response) => {
    return sendSuccess(res, `${moduleName} endpoint scaffold is ready`, null, 501);
  });
