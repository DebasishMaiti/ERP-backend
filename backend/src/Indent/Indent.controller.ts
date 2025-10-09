import { Request, Response } from "express";
import mongoose from "mongoose";
export const STATUS_TYPES = ["draft", "compare", "approval", "approved", "deleted"] as const;
export type StatusType = typeof STATUS_TYPES[number];
import {
  createIndent,
  getAllIndents,
  getDreaftIndents,
  getCompareIndents,
  getApprovalIndents,
  getApprovedIndents,
  getIndentById,
  updateIndent,
  addVendor,
  deleteIndent,
} from "./Indent.Service";

export const createIndentController = async (req: Request, res: Response) => {
  try {
    const { project, boq, boqId, projectId, title, location, neededBy, requester, notes, items, status,comment } = req.body;

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

    const result = await createIndent(project, boq, boqId, projectId,title, location, neededBy, requester, notes, items, status, comment);
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
    const {  title, location, neededBy, requester, notes, items, status} = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid indent ID" });
    }
    if (!title || !location || !neededBy || !requester || !items?.length  ) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const result = await updateIndent(id, title, location, neededBy, requester, notes, items, status);
    if (!result) return res.status(404).json({ message: "Indent not found" });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
 

export const addVendorController = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    
    const { indentId, items, status } = req.body;
 
    if (!indentId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "indentId and items array are required" });
    }
 
    for (const item of items) {
      const { itemId, vendorId, vendorName, pricePerUnit, gstAmount, totalPrice, overrideReason } = item;
      if (!itemId || !vendorId || !vendorName || pricePerUnit == null || gstAmount == null || totalPrice == null ) {
        return res.status(400).json({ message: "Each item must include all required vendor fields" });
      }
    }
 
    if (status && !STATUS_TYPES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed values: ${STATUS_TYPES.join(", ")}` });
    }

    const result = await addVendor(indentId, items, status);

    res.status(200).json({
      message: "Vendors added to items successfully",
      result,
    });
  } catch (err: any) {
    console.error("Error in addVendorController:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
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
