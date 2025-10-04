import { Request, Response } from "express";
import Boq from "./Boq.model";   
import { createBoq, getAllBoq,getBoqByProject, getDraftBoq, getConfirmedBoq, getActiveBoq, getBoqById, updateBoq, deleteBoq,  } from "./Boq.Service";
import mongoose from "mongoose";
 
export const createBoqController = async (req: Request, res: Response) => {
  try {
    const { project, name, description, notes, items, status,projectName} = req.body;
    console.log(req.body);
    
    if(!project || !name || !description || !items){
        return res.status(400).json({ message: "Please fill all the fields" });
    }
 
    const result = await createBoq(project, name, description, notes, items, status,projectName);

    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
 
export const getAllBoqsController = async (req: Request, res: Response) => {
  try {
    const result = await getAllBoq();

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getBoqByProjectController = async(req:Request, res:Response)=>{
  try {

    const result = await getBoqByProject(req.params.id);
    res.status(200).json(result);
  } catch (err:any) {
    res.status(500).json({ message: err.message });
  }
}

export const getDraftBoqsController = async (req: Request, res: Response) => {
  try {
    const result = await getDraftBoq();

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getConfirmBoqsController = async (req: Request, res: Response) => {
  try {
    const result = await getConfirmedBoq();

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getActiveBoqsController = async (req: Request, res: Response) => {
  try {
    const result = await getActiveBoq();

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
 
export const getBoqByIdController = async (req: Request, res: Response) => {
  try {
        
         const result = await getBoqById(req.params.id)

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
 
export const updateBoqController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const { project, name, description, notes, items, status} = req.body;
            
           if(!project || !name || !items){
        return res.status(400).json({ message: "Please fill all the fields" });
    }

    const result = await updateBoq(project, name, description, notes, items, status, id);
 
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

 
export const deleteBoqController = async (req: Request, res: Response) => {
  try {
        const {id} = req.params;
 
         
        const result = await deleteBoq(id);
 
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
 