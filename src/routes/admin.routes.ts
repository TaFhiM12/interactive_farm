import { Router } from "express";
import { Role } from "@prisma/client";

import {
	approveVendor,
	listPendingCertifications,
	listPendingVendors,
	validateCertification,
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));
router.get("/vendors/pending", listPendingVendors);
router.patch("/vendors/:id/approve", approveVendor);
router.get("/certifications/pending", listPendingCertifications);
router.patch("/certifications/:id/validate", validateCertification);

export default router;
