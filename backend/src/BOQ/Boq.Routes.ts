import { Router } from "express";
import {
  createBoqController,
  getAllBoqsController,
  getDraftBoqsController,
  getConfirmBoqsController,
  getActiveBoqsController,
  getBoqByIdController,
  updateBoqController,
  deleteBoqController,
} from "./Boq.controller";

const router = Router();
 
router.post("/", createBoqController);
router.get("/", getAllBoqsController);
router.get("/draft", getDraftBoqsController);
router.get("/confirm", getConfirmBoqsController);
router.get("/active", getActiveBoqsController);
router.get("/:id", getBoqByIdController);
router.put("/:id", updateBoqController);
router.patch("/:id", deleteBoqController);

export default router;
