import { Router } from "express";
import {
  createProjectController,
  getAllProjectsController,
  getPlanedProjectsController,
  getInprogressProjectsController,
  getOnholdProjectsController,
  getCompletedProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} from "./Project.Controller";  

const router = Router();

 
router.post("/", createProjectController);
router.get("/", getAllProjectsController);
router.get("/planed", getPlanedProjectsController);
router.get("/inprogress", getInprogressProjectsController);
router.get("/onhold", getOnholdProjectsController);
router.get("/completed", getCompletedProjectsController);
router.get("/:id", getProjectByIdController);
router.put("/:id", updateProjectController); 
router.patch("/:id", deleteProjectController);

export default router;
