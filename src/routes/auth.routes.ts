import { Router } from "express";

import { login, me, register } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { authRateLimiter } from "../middlewares/rateLimit.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.get("/me", authenticate, me);

export default router;
