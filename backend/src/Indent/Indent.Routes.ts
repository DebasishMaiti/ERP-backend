import { Router } from "express";
import {
  createIndentController,
  getAllIndentsController,
  getDraftIndentsController,
  getCompareIndentsController,
  geApprovalIndentsController,
  geApprovedIndentsController,
  getIndentByIdController,
  updateIndentController,
  addVendorController,
  deleteIndentController,
} from "./Indent.controller";

const router = Router();

router.post("/", createIndentController);
router.get("/", getAllIndentsController);
router.get("/draft", getDraftIndentsController);
router.get("/compare", getCompareIndentsController);
router.get("/approval", geApprovalIndentsController);
router.get("/approved", geApprovedIndentsController);
router.get("/:id", getIndentByIdController);
router.patch("/:id", updateIndentController);
router.patch("/add-vendor",addVendorController);
router.patch("/delete/:id", deleteIndentController);


export default router;