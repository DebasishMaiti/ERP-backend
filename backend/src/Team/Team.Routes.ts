import { Router } from "express";
import { createTeamController, getAllTeamController, getActiveTeamController, getInctiveTeamController, getTeamByTeamIdController,getTeamByIdController, updateTeamController, deleteTeamController} from "./Team.controller";

const router = Router();

router.post("/", createTeamController);

router.get("/", getAllTeamController);
router.get("/active", getActiveTeamController);
router.get("/inactive", getInctiveTeamController);
router.get('/:id', getTeamByTeamIdController);
router.get('/byId/:id', getTeamByIdController);
router.put('/:id', updateTeamController);
router.patch('/:id', deleteTeamController)

export default router;
