import { CertificationStatus, Role } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

const submitCertSchema = z.object({
  certifyingAgency: z.string().min(2),
  certificationDate: z.coerce.date(),
});

export const submitCertification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    throw new AppError("Only vendors can submit certification", 403);
  }

  const payload = submitCertSchema.parse(req.body);

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
  if (!vendor) {
    throw new AppError("Vendor profile not found", 404);
  }

  const cert = await prisma.sustainabilityCert.create({
    data: {
      vendorId: vendor.id,
      certifyingAgency: payload.certifyingAgency,
      certificationDate: payload.certificationDate,
      status: CertificationStatus.PENDING,
    },
  });

  return sendSuccess(res, "Certification submitted for review", cert, 201);
});

export const listMyCertifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.VENDOR) {
    throw new AppError("Only vendors can view certifications", 403);
  }

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
  if (!vendor) {
    throw new AppError("Vendor profile not found", 404);
  }

  const certs = await prisma.sustainabilityCert.findMany({
    where: { vendorId: vendor.id },
    orderBy: { certificationDate: "desc" },
  });

  return sendSuccess(res, "Vendor certifications fetched", certs);
});
