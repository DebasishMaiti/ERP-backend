import { Request, Response } from "express";
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getOpenPurchaseOrders,
  getPartialPurchaseOrders,
  getClosedPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from "./Po.Service";
import mongoose from "mongoose";

export const createPurchaseOrderController = async (req: Request, res: Response) => {
  try {
    const { project, vendor, items, fleetCost, purchaserReason, subtotal, gstTotal, finalTotal, status } = req.body;

    if (!project || !vendor || !items || !subtotal || !gstTotal || !finalTotal) {
      return res.status(400).json({ message: "Please fill all the required fields" });
    }

    const result = await createPurchaseOrder(
      project,
      vendor,
      items,
      fleetCost,
      purchaserReason,
      subtotal,
      gstTotal,
      finalTotal,
      status
    );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating purchase order", error: error.message });
  }
};

export const getAllPurchaseOrdersController = async (req: Request, res: Response) => {
  try {
    const result = await getAllPurchaseOrders();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving purchase orders", error: error.message });
  }
};
export const getOpenPurchaseOrdersController = async (req: Request, res: Response) => {
  try {
    const result = await getOpenPurchaseOrders();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving purchase orders", error: error.message });
  }
};
export const getPartialPurchaseOrdersController = async (req: Request, res: Response) => {
  try {
    const result = await getPartialPurchaseOrders();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving purchase orders", error: error.message });
  }
};
export const getClosedPurchaseOrdersController = async (req: Request, res: Response) => {
  try {
    const result = await getClosedPurchaseOrders();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving purchase orders", error: error.message });
  }
};

export const getPurchaseOrderByIdController = async (req: Request, res: Response) => {
  try {
       const {id} = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid purchase order ID");
      }
    const result = await getPurchaseOrderById(id);
    if (!result) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving purchase order", error: error.message });
  }
};

export const updatePurchaseOrderController = async (req: Request, res: Response) => {
  try {
        const {id} = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid purchase order ID");
      }
    const { project, vendor, items, fleetCost, purchaserReason, subtotal, gstTotal, finalTotal, status } = req.body;

    if (!project || !vendor || !items || !subtotal || !gstTotal || !finalTotal) {
      return res.status(400).json({ message: "Please fill all the required fields" });
    }

    const result = await updatePurchaseOrder(
      id,
      project,
      vendor,
      items,
      fleetCost,
      purchaserReason,
      subtotal,
      gstTotal,
      finalTotal,
      status
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating purchase order", error: error.message });
  }
};

export const deletePurchaseOrderController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid purchase order ID");
      }
    await deletePurchaseOrder(id);
    res.status(200).json({ message: "Purchase order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting purchase order", error: error.message });
  }
};
