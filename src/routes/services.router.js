import { Router } from "express";
import {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
} from "../controllers/services.controller.js";
import {
    validateSchema,
    validateQuery,
    createServiceSchema,
    updateServiceSchema,
    getServicesQuerySchema,
} from "../middlewares/validator.middleware.js";

const router = Router();

router.get("/", validateQuery(getServicesQuerySchema), getServices);
router.get("/:sid", getServiceById);
router.delete("/:sid", deleteService);
router.post("/", validateSchema(createServiceSchema), createService);
router.put("/:sid", validateSchema(updateServiceSchema), updateService);

export default router;