import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { emitPlantUpdated } from "../utils/socket.js";

const createTrackSchema = z.object({
  rentalSpaceId: z.string().optional(),
  plantName: z.string().min(2),
  growthStage: z.string().min(2),
  healthStatus: z.string().min(2),
  expectedHarvestDate: z.coerce.date().optional(),
});

const updateTrackSchema = z.object({
  growthStage: z.string().min(2).optional(),
  healthStatus: z.string().min(2).optional(),
  expectedHarvestDate: z.coerce.date().optional(),
});

export const listPlantTracks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const items = await prisma.plantTrack.findMany({
    where: { userId: req.user.id },
    include: {
      rentalSpace: {
        select: { id: true, location: true, size: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return sendSuccess(res, "Plant tracking data fetched", items);
});

export const createPlantTrack = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = createTrackSchema.parse(req.body);

  const created = await prisma.plantTrack.create({
    data: {
      userId: req.user.id,
      rentalSpaceId: payload.rentalSpaceId,
      plantName: payload.plantName,
      growthStage: payload.growthStage,
      healthStatus: payload.healthStatus,
      expectedHarvestDate: payload.expectedHarvestDate,
    },
  });

  emitPlantUpdated(created);

  return sendSuccess(res, "Plant tracking entry created", created, 201);
});

export const updatePlantTrack = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = updateTrackSchema.parse(req.body);
  const trackIdParam = req.params.id;
  const trackId = Array.isArray(trackIdParam) ? trackIdParam[0] : trackIdParam;
  if (!trackId) {
    throw new AppError("Plant track id is required", 400);
  }

  const existing = await prisma.plantTrack.findUnique({ where: { id: trackId } });
  if (!existing) {
    throw new AppError("Plant track not found", 404);
  }

  if (existing.userId !== req.user.id) {
    throw new AppError("Forbidden", 403);
  }

  const updated = await prisma.plantTrack.update({
    where: { id: trackId },
    data: payload,
  });

  emitPlantUpdated(updated);

  return sendSuccess(res, "Plant tracking updated", updated);
});
