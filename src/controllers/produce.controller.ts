import { CertificationStatus, Role } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

const createProduceSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.coerce.number().positive(),
  category: z.string().min(2),
  availableQuantity: z.coerce.number().int().nonnegative(),
});

const updateProduceSchema = createProduceSchema.partial();

export const listProduces = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;

  const where = {
    certificationStatus: CertificationStatus.APPROVED,
    ...(category ? { category } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.produce.findMany({
      where,
      skip,
      take: limit,
      include: {
        vendor: {
          select: { id: true, farmName: true, farmLocation: true, certificationStatus: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.produce.count({ where }),
  ]);

  return sendSuccess(res, "Produce fetched successfully", items, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const createProduce = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    throw new AppError("Only vendors can create products", 403);
  }

  const payload = createProduceSchema.parse(req.body);

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
  if (!vendor) {
    throw new AppError("Vendor profile not found", 404);
  }

  if (vendor.certificationStatus !== CertificationStatus.APPROVED) {
    throw new AppError("Vendor certification is not approved", 403);
  }

  const created = await prisma.produce.create({
    data: {
      vendorId: vendor.id,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      category: payload.category,
      availableQuantity: payload.availableQuantity,
      certificationStatus: CertificationStatus.APPROVED,
    },
  });

  return sendSuccess(res, "Produce created", created, 201);
});

export const updateProduce = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = updateProduceSchema.parse(req.body);
  const produceIdParam = req.params.id;
  const produceId = Array.isArray(produceIdParam) ? produceIdParam[0] : produceIdParam;
  if (!produceId) {
    throw new AppError("Produce id is required", 400);
  }

  const produce = await prisma.produce.findUnique({
    where: { id: produceId },
    include: { vendor: { select: { userId: true } } },
  });

  if (!produce) {
    throw new AppError("Produce not found", 404);
  }

  const canUpdate = req.user.role === Role.ADMIN || produce.vendor.userId === req.user.id;
  if (!canUpdate) {
    throw new AppError("Forbidden", 403);
  }

  const updated = await prisma.produce.update({
    where: { id: produceId },
    data: payload,
  });

  return sendSuccess(res, "Produce updated", updated);
});

export const deleteProduce = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const produceIdParam = req.params.id;
  const produceId = Array.isArray(produceIdParam) ? produceIdParam[0] : produceIdParam;
  if (!produceId) {
    throw new AppError("Produce id is required", 400);
  }

  const produce = await prisma.produce.findUnique({
    where: { id: produceId },
    include: { vendor: { select: { userId: true } } },
  });

  if (!produce) {
    throw new AppError("Produce not found", 404);
  }

  const canDelete = req.user.role === Role.ADMIN || produce.vendor.userId === req.user.id;
  if (!canDelete) {
    throw new AppError("Forbidden", 403);
  }

  await prisma.produce.delete({ where: { id: produceId } });

  return sendSuccess(res, "Produce deleted", null);
});
