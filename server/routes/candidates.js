import { Router } from "express";
import * as ctrl from "../controllers/candidatesController.js";

const router = Router();

router.get("/", ctrl.list);
router.get("/export/csv", ctrl.exportCsv);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.patch("/:id/stage", ctrl.updateStage);
router.patch("/:id/note", ctrl.updateNote);
router.patch("/:id/follow-up", ctrl.updateFollowUp);
router.patch("/:id/tasks", ctrl.addTask);
router.delete("/:id", ctrl.remove);

export default router;
