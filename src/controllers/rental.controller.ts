import { Role } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

const createRentalSchema = z.object({
  location: z.string().min(2),
  size: z.string().min(2),
  price: z.coerce.number().positive(),
  availability: z.boolean().optional(),
});

const bookSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const listRentalSpaces = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const location = typeof req.query.location === "string" ? req.query.location : undefined;
  const onlyAvailable = req.query.available === "true";

  const where = {
    ...(location ? { location: { contains: location, mode: "insensitive" as const } } : {}),
    ...(onlyAvailable ? { availability: true } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.rentalSpace.findMany({
      where,
      skip,
      take: limit,
      include: {
        vendor: {
          select: {
            id: true,
            farmName: true,
            farmLocation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rentalSpace.count({ where }),
  ]);

  return sendSuccess(res, "Rental spaces fetched", items, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const createRentalSpace = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    throw new AppError("Only vendors can create rental spaces", 403);
  }

  const payload = createRentalSchema.parse(req.body);

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
  if (!vendor) {
    throw new AppError("Vendor profile not found", 404);
  }

  const created = await prisma.rentalSpace.create({
    data: {
      vendorId: vendor.id,
      location: payload.location,
      size: payload.size,
      price: payload.price,
      availability: payload.availability ?? true,
    },
  });

  return sendSuccess(res, "Rental space created", created, 201);
});

export const bookRentalSpace = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.CUSTOMER) {
    throw new AppError("Only customers can book spaces", 403);
  }

  const payload = bookSchema.parse(req.body);
  const rentalSpaceIdParam = req.params.id;
  const rentalSpaceId = Array.isArray(rentalSpaceIdParam) ? rentalSpaceIdParam[0] : rentalSpaceIdParam;
  if (!rentalSpaceId) {
    throw new AppError("Rental space id is required", 400);
  }

  const rentalSpace = await prisma.rentalSpace.findUnique({ where: { id: rentalSpaceId } });
  if (!rentalSpace) {
    throw new AppError("Rental space not found", 404);
  }

  if (!rentalSpace.availability) {
    throw new AppError("Rental space is not available", 400);
  }

  const booking = await prisma.rentalBooking.create({
    data: {
      userId: req.user.id,
      rentalSpaceId,
      startDate: payload.startDate,
      endDate: payload.endDate,
    },
  });

  await prisma.rentalSpace.update({
    where: { id: rentalSpaceId },
    data: { availability: false },
  });

  return sendSuccess(res, "Rental space booked", booking, 201);
});
