import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

const createPostSchema = z.object({
  postContent: z.string().min(3),
});

export const listCommunityPosts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

  const [items, total] = await Promise.all([
    prisma.communityPost.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { postDate: "desc" },
    }),
    prisma.communityPost.count(),
  ]);

  return sendSuccess(res, "Community posts fetched", items, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const createCommunityPost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = createPostSchema.parse(req.body);

  const post = await prisma.communityPost.create({
    data: {
      userId: req.user.id,
      postContent: payload.postContent,
    },
  });

  return sendSuccess(res, "Community post created", post, 201);
});
