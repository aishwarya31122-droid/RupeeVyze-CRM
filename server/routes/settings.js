import { Router } from "express";
import * as ctrl from "../controllers/settingsController.js";

const router = Router();
router.get("/", ctrl.get);
router.put("/", ctrl.update);
export default router;
