import { Request, Response } from "express";
import {getReport} from './Report.Service'

export const getReportController = async (req: Request, res: Response) => {
    const result = await getReport(); 
  res.status(200).json(result);
};
