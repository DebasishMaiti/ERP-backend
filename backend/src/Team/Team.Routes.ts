import { Router } from "express";
import { createTeamController, getAllTeamController, getActiveTeamController, getInctiveTeamController, getTeamByIdController, updateTeamController, deleteTeamController} from "./Team.controller";

const router = Router();

router.post("/", createTeamController);

router.get("/", getAllTeamController);
router.get("/active", getActiveTeamController);
router.get("/inactive", getInctiveTeamController);
router.get('/:id', getTeamByIdController);
router.put('/:id', updateTeamController);
router.patch('/:id', deleteTeamController)

export default router;
