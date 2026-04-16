import { Router } from "express";
import { Role } from "@prisma/client";

import { createOrder, listOrders } from "../controllers/order.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, listOrders);
router.post("/", authenticate, authorize(Role.CUSTOMER), createOrder);

export default router;
