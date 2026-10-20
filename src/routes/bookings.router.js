import { Router } from "express";
import { createBooking, getBookingById, addServiceToBooking } from "../controllers/bookings.controller.js";
import { validateSchema, createBookingSchema, addServiceToBookingSchema } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validateSchema(createBookingSchema), createBooking);
router.get("/:bid", getBookingById);
router.post("/:bid/services/:sid", validateSchema(addServiceToBookingSchema), addServiceToBooking);

export default router;