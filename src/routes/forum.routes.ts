import { Router } from "express";

import { createCommunityPost, listCommunityPosts } from "../controllers/forum.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/posts", listCommunityPosts);
router.post("/posts", authenticate, createCommunityPost);

export default router;
