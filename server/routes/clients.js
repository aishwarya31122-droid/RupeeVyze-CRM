import { Router } from "express";
import * as ctrl from "../controllers/clientsController.js";

const router = Router();

router.get("/", ctrl.list);
router.get("/policies", ctrl.getPolicies);
router.get("/claims", ctrl.getClaims);
router.get("/renewals", ctrl.getRenewals);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);

export default router;
