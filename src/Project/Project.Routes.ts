import { Router } from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} from "./Project.Controller";  

const router = Router();

 
router.post("/", createProjectController);

 
router.get("/", getProjectsController);

router.get("/:id", getProjectByIdController);
router.put("/:id", updateProjectController); 
router.delete("/:id", deleteProjectController);

export default router;
