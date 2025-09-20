import { Router } from "express";
import { getReportController } from "./Report.Controller";

const router = Router();

router.get("/", getReportController);

export default router;
