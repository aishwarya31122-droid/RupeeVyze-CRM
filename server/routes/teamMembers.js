import { Router } from "express";
import * as ctrl from "../controllers/teamMembersController.js";

const router = Router();
router.get("/", ctrl.list);
export default router;
