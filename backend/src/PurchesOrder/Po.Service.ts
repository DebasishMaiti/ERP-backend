import PurchaseOrder from "./Po.Model";
import mongoose from "mongoose";

export const createPurchaseOrder = async (
  project: string,
  vendor: string,
  items: {
    item: string;
    description?: string;
    quantity: number;
    unit?: string;
    rate: number;
    gst?: number;
    total: number;
    receivedQty?: number;
  }[],
  fleetCost: number,
  purchaserReason: string,
  subtotal: number,
  gstTotal: number,
  finalTotal: number,
  status: "open" | "partial" | "closed"
) => {
  const result = await PurchaseOrder.create({
    project,
    vendor,
    items,
    fleetCost,
    purchaserReason,
    subtotal,
    gstTotal,
    finalTotal,
    status,
  });
  return result;
};

export const getAllPurchaseOrders = async () => {
  return await PurchaseOrder.find({ status: { $ne: "deleted" } })
 
};

export const getOpenPurchaseOrders = async () => {
  return await PurchaseOrder.find({ status: "open" })
 
};

export const getPartialPurchaseOrders = async () => {
  return await PurchaseOrder.find({ status: "partial" })
 
};

export const getClosedPurchaseOrders = async () => {
  return await PurchaseOrder.find({ status: "closed" })
 
};

export const getPurchaseOrderById = async (id: string) => {

  return await PurchaseOrder.findById(id)
  
};

export const updatePurchaseOrder = async (
  id: string,
  project: string,
  vendor: string,
  items: {
    item: string;
    description?: string;
    quantity: number;
    unit?: string;
    rate: number;
    gst?: number;
    total: number;
    receivedQty?: number;
  }[],
  fleetCost: number,
  purchaserReason: string,
  subtotal: number,
  gstTotal: number,
  finalTotal: number,
  status: "open" | "partial" | "closed"
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid purchase order ID");
  }
  return await PurchaseOrder.findByIdAndUpdate(
    id,
    {
      project,
      vendor,
      items,
      fleetCost,
      purchaserReason,
      subtotal,
      gstTotal,
      finalTotal,
      status,
    },
    { new: true, runValidators: true }
  );
};

export const deletePurchaseOrder = async (id: string) => {

  const result= await PurchaseOrder.findByIdAndUpdate(id,{status:"deleted"});
  return result;
};
