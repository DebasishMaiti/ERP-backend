import express from "express";
import {
  createPurchaseOrderController,
  getPurchaseOrdersController,
  getPurchaseOrderByIdController,
  updatePurchaseOrderController,
  deletePurchaseOrderController,
} from "./Po.Controller";

const router = express.Router();

router.post("/", createPurchaseOrderController);      
router.get("/", getPurchaseOrdersController);         
router.get("/:id", getPurchaseOrderByIdController);   
router.put("/:id", updatePurchaseOrderController);    
router.delete("/:id", deletePurchaseOrderController); 

export default router;
