import { Request, Response } from "express";
 
import {createTeam, getAllTeam, getActiveTeam, getInactiveTeam, getTeamByTeamId,getTeamById, updateTeam, deleteTeam} from "./Team.Service"
import mongoose from "mongoose";


export const createTeamController = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, status, notes, permissions } = req.body;

    if (!name || !email || !phone || !status || !permissions) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const result = await createTeam(
      name,
      email,
      phone,
      status,
      notes,
      permissions 
    );

    res.status(201).json({
      message: "User created successfully",
     result,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};
 
export const getAllTeamController = async (req: Request, res: Response) => {
  try {
    const result = await getAllTeam();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const getActiveTeamController = async (req:Request, res:Response)=>{
  try {
       const result = await getActiveTeam();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching active users", error });
  }
}

export const getInctiveTeamController = async (req:Request, res:Response)=>{
  try {
       const result = await getInactiveTeam();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching active users", error });
  }
}

export const getTeamByTeamIdController = async (req: Request, res: Response) => {
  try {
      
        const result = await getTeamByTeamId(req.params.id);
        res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const getTeamByIdController = async (req: Request, res: Response) => {
  try {
      
        const result = await getTeamById(req.params.id);
        res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const updateTeamController = async (req: Request, res: Response) => {
  try { const {id} = req.params;
      const { name, email, phone, status, notes, permissions } = req.body;

    if (!name || !email || !phone || !status || !notes || !permissions) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
      const result = await updateTeam(
      name,
      email,
      phone,
      status,
      notes,
      permissions ,
      id
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const deleteTeamController = async (req: Request, res: Response) => {
  try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(400).json({ message: "Invalid vendor ID" });
        }
        const result = await deleteTeam(req.params.id);
        res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

