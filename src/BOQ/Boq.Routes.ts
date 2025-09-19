import { Router } from "express";
import {
  createBoqController,
  getBoqsController,
  getBoqByIdController,
  updateBoqController,
  deleteBoqController,
   
 
} from "./Boq.controller";

const router = Router();
 
router.post("/", createBoqController);
 
router.get("/", getBoqsController);
 
router.get("/:id", getBoqByIdController);
 
router.put("/:id", updateBoqController);
 
router.delete("/:id", deleteBoqController);

 
 

export default router;
