import { Router } from "express";
import * as ctrl from "../controllers/performanceController.js";

const router = Router();
router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
export default router;
