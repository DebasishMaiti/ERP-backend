import { Router } from "express";
import {
  createIndentController,
  getIndentsController,
  getIndentByIdController,
  updateIndentController,
  deleteIndentController,
} from "./Indent.controller";

const router = Router();

router.post("/", createIndentController);
router.get("/", getIndentsController);
router.get("/:id", getIndentByIdController);
router.put("/:id", updateIndentController);
router.delete("/:id", deleteIndentController);


export default router;
