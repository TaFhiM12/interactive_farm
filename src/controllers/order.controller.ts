import { OrderStatus, Role } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

const createOrderSchema = z.object({
  produceId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

  const roleFilter =
    req.user.role === Role.ADMIN
      ? {}
      : req.user.role === Role.VENDOR
        ? { vendor: { userId: req.user.id } }
        : { userId: req.user.id };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: roleFilter,
      skip,
      take: limit,
      include: {
        produce: {
          select: { id: true, name: true, price: true },
        },
        vendor: {
          select: { id: true, farmName: true },
        },
      },
      orderBy: { orderDate: "desc" },
    }),
    prisma.order.count({ where: roleFilter }),
  ]);

  return sendSuccess(res, "Orders fetched", items, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.CUSTOMER) {
    throw new AppError("Only customers can create orders", 403);
  }

  const payload = createOrderSchema.parse(req.body);

  const produce = await prisma.produce.findUnique({
    where: { id: payload.produceId },
    include: { vendor: true },
  });

  if (!produce) {
    throw new AppError("Produce not found", 404);
  }

  if (produce.availableQuantity < payload.quantity) {
    throw new AppError("Insufficient produce quantity", 400);
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: req.user!.id,
        produceId: produce.id,
        vendorId: produce.vendorId,
        status: OrderStatus.PENDING,
      },
    });

    await tx.produce.update({
      where: { id: produce.id },
      data: {
        availableQuantity: {
          decrement: payload.quantity,
        },
      },
    });

    return created;
  });

  return sendSuccess(res, "Order created", order, 201);
});
