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
router.get("/:itemId", getItemByIdController); 
router.put("/:id", updateItemController); 
router.patch("/:itemId", deleteItemController);  
 

export default router;