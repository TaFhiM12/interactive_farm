import { Router } from "express";

import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import certificationRoutes from "./certification.routes.js";
import forumRoutes from "./forum.routes.js";
import orderRoutes from "./order.routes.js";
import produceRoutes from "./produce.routes.js";
import rentalRoutes from "./rental.routes.js";
import trackingRoutes from "./tracking.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/produces", produceRoutes);
router.use("/rentals", rentalRoutes);
router.use("/orders", orderRoutes);
router.use("/community", forumRoutes);
router.use("/tracking", trackingRoutes);
router.use("/certifications", certificationRoutes);
router.use("/admin", adminRoutes);

export default router;
