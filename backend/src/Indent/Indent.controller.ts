import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  createIndent,
  getAllIndents,
  getDreaftIndents,
  getCompareIndents,
  getApprovalIndents,
  getApprovedIndents,
  getIndentById,
  updateIndent,
  deleteIndent,
} from "./Indent.Service";

export const createIndentController = async (req: Request, res: Response) => {
  try {
    const { project, boq, title, location, neededBy, requester, notes, items, status,comment } = req.body;

    if (!project || !boq || !title || !location || !neededBy || !requester || !items?.length || !status) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    for (const item of items) {
      if (!item.itemId || !item.quantity) {
        return res.status(400).json({ message: "Each item must have itemId and quantity" });
      }
      if (item.selectedVendor && !item.selectedVendor.vendor) {
        return res.status(400).json({ message: "Selected vendor must include vendor ID" });
      }
    }

    const result = await createIndent(project, boq, title, location, neededBy, requester, notes, items, status, comment);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllIndentsController = async (req: Request, res: Response) => {
  try {
    const result = await getAllIndents();
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getDraftIndentsController = async (req: Request, res: Response) => {
  try {
    const result = await getDreaftIndents();
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCompareIndentsController = async (req: Request, res: Response) => {
  try {
    const result = await getCompareIndents();
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const geApprovalIndentsController = async (req: Request, res: Response) => {
  try {
    const result = await getApprovalIndents();
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const geApprovedIndentsController = async (req: Request, res: Response) => {
  try {
    const result = await getApprovedIndents();
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getIndentByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid indent ID" });
    }

    const result = await getIndentById(id);
    if (!result) return res.status(404).json({ message: "Indent not found" });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateIndentController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { project, boq, title, location, neededBy, requester, notes, items, status, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid indent ID" });
    }
    if (!project || !boq || !title || !location || !neededBy || !requester || !items?.length || !status) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const result = await updateIndent(project, boq, title, location, neededBy, requester, notes, items, id, status, comment);
    if (!result) return res.status(404).json({ message: "Indent not found" });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteIndentController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid indent ID" });
    }

    const result = await deleteIndent(id);
    if (!result) return res.status(404).json({ message: "Indent not found" });

    res.status(200).json({message:"Indent deleted"});
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
