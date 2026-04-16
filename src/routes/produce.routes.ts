import { Router } from "express";
import { Role } from "@prisma/client";

import { createProduce, deleteProduce, listProduces, updateProduce } from "../controllers/produce.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/", listProduces);
router.post("/", authenticate, authorize(Role.VENDOR), createProduce);
router.patch("/:id", authenticate, authorize(Role.VENDOR, Role.ADMIN), updateProduce);
router.delete("/:id", authenticate, authorize(Role.VENDOR, Role.ADMIN), deleteProduce);

export default router;
