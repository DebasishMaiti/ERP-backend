import { Router } from "express";
import {
  createVendorController,
  getVendorsController,
  getVendorByIdController,
  updateVendorController,
  deleteVendorController,
} from "./Vendor.Controller";

const router = Router();

router.post("/", createVendorController);       
router.get("/", getVendorsController);          
router.get("/:id", getVendorByIdController);    
router.put("/:id", updateVendorController);     
router.delete("/:id", deleteVendorController);  

export default router;
