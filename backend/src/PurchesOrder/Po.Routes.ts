import express from "express";
import {
  createPurchaseOrderController,
  getAllPurchaseOrdersController,
  getOpenPurchaseOrdersController,
  getPartialPurchaseOrdersController,
  getClosedPurchaseOrdersController,
  getPurchaseOrderByIdController,
  updatePurchaseOrderController,
  deletePurchaseOrderController,
} from "./Po.Controller";

const router = express.Router();

router.post("/", createPurchaseOrderController);      
router.get("/", getAllPurchaseOrdersController);
router.get("/open", getOpenPurchaseOrdersController);
router.get("/partial", getPartialPurchaseOrdersController);
router.get("/closed", getClosedPurchaseOrdersController);         
router.get("/:id", getPurchaseOrderByIdController);   
router.put("/:id", updatePurchaseOrderController);    
router.patch("/:id", deletePurchaseOrderController); 

export default router;
