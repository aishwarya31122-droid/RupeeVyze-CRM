import { Router } from "express";
import * as ctrl from "../controllers/overridePayoutsController.js";

const router = Router();
router.get("/", ctrl.list);
router.put("/", ctrl.replaceAll);
export default router;
