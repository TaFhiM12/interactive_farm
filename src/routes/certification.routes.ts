import { Router } from "express";
import { Role } from "@prisma/client";

import { listMyCertifications, submitCertification } from "../controllers/certification.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.use(authenticate, authorize(Role.VENDOR));
router.get("/me", listMyCertifications);
router.post("/submit", submitCertification);

export default router;
