import { Router } from "express";
import { Role } from "@prisma/client";

import { bookRentalSpace, createRentalSpace, listRentalSpaces } from "../controllers/rental.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/", listRentalSpaces);
router.post("/", authenticate, authorize(Role.VENDOR), createRentalSpace);
router.post("/:id/book", authenticate, authorize(Role.CUSTOMER), bookRentalSpace);

export default router;
