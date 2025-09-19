import { Router } from "express";
import {
  createItemController,
  getItemsController,
  getItemByIdController,
  updateItemController,
  deleteItemController,
} from "./Item.Controller";

const router = Router();

 
router.post("/", createItemController);          
router.get("/", getItemsController);             
router.get("/:id", getItemByIdController);       
router.put("/:id", updateItemController);        
router.delete("/:id", deleteItemController);     

export default router;
