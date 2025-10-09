import Indent from "./Indent.Model";

export const createIndent = async (
  project: string,
  boq: string,
  boqId:string,
  projectId:string,
  title: string,
  location: string,
  neededBy: Date,
  requester: string,
  notes: string,
  items: any[],
  status: string,
  comment: string
) => {
  const result = await Indent.create({
    project,
    boq,
    boqId,
    projectId,
    title,
    location,
    neededBy,
    requester,
    notes,
    items,  
    status,
    comment
  });
  return result;
};

export const getAllIndents = async () => {
  const result = await Indent.find({ status: { $ne: "deleted" } })
 
  return result;
};

export const getDreaftIndents = async () => {
  const result = await Indent.find({ status: "draft" })
 
  return result;
};

export const getCompareIndents = async () => {
  const result = await Indent.find({ status: "compare" })
 
  return result;
};

export const getApprovalIndents = async () => {
  const result = await Indent.find({ status: "approval"})
 
  return result;
};

export const getApprovedIndents = async () => {
  const result = await Indent.find({ status: "approved" })
 
  return result;
};

export const getIndentById = async (id: string) => {
  const result = await Indent.findById(id)
 
  return result;
};

export const updateIndent = async (
  id: string,
  title: string,
  location: string,
  neededBy: Date,
  requester: string,
  notes: string,
  items: any[],
  status: string,
   
) => {
  const result = await Indent.findByIdAndUpdate(
    id,
    { title, location, neededBy, requester, notes, items, status },
    { new: true }
  )
  
  return result;
};

import { StatusType } from "./Indent.controller";

export const addVendor = async (
  indentId: string,
  items: any [],
  status?: StatusType
) => {
  const indent = await Indent.findById(indentId);
  if (!indent) throw new Error("Indent not found");
 
  for (const item of items) {
    const foundItem = indent.items.find((i: any) => i.itemId.toString() === item.itemId);
    if (foundItem) {
      foundItem.selectedVendor = {
        vendor: item.vendorId,
        vendorName: item.vendorName,
        pricePerUnit: item.pricePerUnit,
        gstAmount: item.gstAmount,
        fleetCost: item.fleetCost ?? 0,
        totalPrice: item.totalPrice,
        overrideReason: item.overrideReason,
      };
    }
  }
 
  if (status) {
    indent.status = status;
  }

  const result = await indent.save();
  return result;
};


export const deleteIndent = async (id: string) => {
  const result = await Indent.findByIdAndUpdate(id,{status:"deleted"});
  return result;
};
