import { Router } from "express";
import { createTeamController, getTeamController, getTeamByIdController, updateTeamController, deleteTeamController} from "./Team.controller";

const router = Router();

router.post("/", createTeamController);

router.get("/", getTeamController);
router.get('/:id', getTeamByIdController);
router.put('/:id', updateTeamController);
router.delete('/:id', deleteTeamController)

export default router;
