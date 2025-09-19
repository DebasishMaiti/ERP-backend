import { Request, Response } from "express";
import { 
  createProject, 
  getProject, 
  getProjectById, 
  updateProject, 
  deleteProject 
} from "./Project.Service";
import mongoose from "mongoose";

 
export const createProjectController = async (req: Request, res: Response) => {
  try {
    const { name, projectCode,location, startDate, targetCompletionDate, status, notes, employees } = req.body;

    if (!name || !projectCode || !location || !startDate || !targetCompletionDate || !status || !employees) {
      return res.status(400).json({ message: "Please fill all the required fields" });
    }

    const result = await createProject(name, projectCode, location, startDate, targetCompletionDate, status, notes, employees);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
};
 
export const getProjectsController = async (req: Request, res: Response) => {
  try {
    const result = await getProject();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving projects", error });
  }
};
 
export const getProjectByIdController = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    const result = await getProjectById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving project", error });
  }
};

export const updateProjectController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, projectCode, location, startDate, targetCompletionDate, status, notes, employees } = req.body;

    if (!name || !projectCode || !location || !startDate || !targetCompletionDate || !status || !employees) {
      return res.status(400).json({ message: "Please fill all the required fields" });
    }

    const result = await updateProject(name, projectCode, location, startDate, targetCompletionDate, status, notes, employees, id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error });
  }
};

export const deleteProjectController = async (req: Request, res: Response) => {
  try {
    const result = await deleteProject(req.params.id);
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error });
  }
};
