import { CertificationStatus, Role, UserStatus } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

const approveSchema = z.object({
  approve: z.boolean(),
});

const certValidationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const listPendingVendors = asyncHandler(async (_req: Request, res: Response) => {
  const vendors = await prisma.vendorProfile.findMany({
    where: {
      OR: [
        { certificationStatus: CertificationStatus.PENDING },
        { user: { status: UserStatus.PENDING } },
      ],
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, status: true, role: true },
      },
    },
  });

  return sendSuccess(res, "Pending vendors fetched", vendors);
});

export const approveVendor = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    throw new AppError("Only admins can approve vendors", 403);
  }

  const payload = approveSchema.parse(req.body);
  const userIdParam = req.params.id;
  const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
  if (!userId) {
    throw new AppError("Vendor user id is required", 400);
  }

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }

  const certificationStatus = payload.approve ? CertificationStatus.APPROVED : CertificationStatus.REJECTED;
  const userStatus = payload.approve ? UserStatus.ACTIVE : UserStatus.SUSPENDED;

  const result = await prisma.$transaction(async (tx) => {
    const updatedVendor = await tx.vendorProfile.update({
      where: { userId },
      data: { certificationStatus },
    });

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { status: userStatus },
    });

    return { updatedVendor, updatedUser };
  });

  return sendSuccess(res, payload.approve ? "Vendor approved" : "Vendor rejected", result);
});

export const listPendingCertifications = asyncHandler(async (_req: Request, res: Response) => {
  const certs = await prisma.sustainabilityCert.findMany({
    where: { status: CertificationStatus.PENDING },
    include: {
      vendor: {
        select: { id: true, farmName: true, farmLocation: true },
      },
    },
  });

  return sendSuccess(res, "Pending certifications fetched", certs);
});

export const validateCertification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    throw new AppError("Only admins can validate certifications", 403);
  }

  const payload = certValidationSchema.parse(req.body);
  const certIdParam = req.params.id;
  const certId = Array.isArray(certIdParam) ? certIdParam[0] : certIdParam;
  if (!certId) {
    throw new AppError("Certification id is required", 400);
  }

  const cert = await prisma.sustainabilityCert.findUnique({ where: { id: certId } });
  if (!cert) {
    throw new AppError("Certification not found", 404);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCert = await tx.sustainabilityCert.update({
      where: { id: certId },
      data: { status: payload.status },
    });

    const updatedVendor = await tx.vendorProfile.update({
      where: { id: cert.vendorId },
      data: { certificationStatus: payload.status },
    });

    return { updatedCert, updatedVendor };
  });

  return sendSuccess(res, "Certification validated", updated);
});
