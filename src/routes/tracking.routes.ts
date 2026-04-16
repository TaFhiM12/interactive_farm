import { Router } from "express";

import { createPlantTrack, listPlantTracks, updatePlantTrack } from "../controllers/tracking.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/plants", authenticate, listPlantTracks);
router.post("/plants", authenticate, createPlantTrack);
router.patch("/plants/:id", authenticate, updatePlantTrack);

export default router;
