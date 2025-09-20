import { Request, Response } from "express";
import mongoose from "mongoose";
import { createVendor, getVendors, getVendorById, updateVendor,deleteVendor} from "./Vendor.Service";

 
export const createVendorController = async (req: Request, res: Response) => {
  try {
    const { name, contactPerson, phone, email, address, gstin, paymentDays, active, notes,status } =
      req.body;
    console.log(req.body);
    
    if(!name || !contactPerson || !phone|| !email|| !address|| !gstin|| !paymentDays|| !notes || !status){
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    
    const result  = await createVendor( name, contactPerson, phone, email, address, gstin, paymentDays, notes, status );
 
    res.status(201).json({ message: "Vendor created successfully", result });
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Duplicate value", error: error.keyValue });
    }
    res
      .status(500)
      .json({ message: "Error creating vendor", error: error.message });
  }
};

 
export const getVendorsController = async (req: Request, res: Response) => {
  try {
 
    const result = await getVendors()

    res.status(200).json({result
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching vendors", error: error.message });
  }
};

 
export const getVendorByIdController = async (req: Request, res: Response) => {
  try {
   const result = await getVendorById(req.params.id)

    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching vendor", error: error.message });
  }
};

 
export const updateVendorController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }
      const { name, contactPerson, phone, email, address, gstin, paymentDays, active, notes } =
      req.body;

    if(!name || !contactPerson || !phone|| !email|| !address|| !gstin|| !paymentDays|| !active|| !notes){
      return res.status(400).json({ message: "Please fill all the fields" });
    }   
    const result = await updateVendor(name, contactPerson, phone, email, address, gstin, paymentDays, active, notes, id);
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error updating vendor", error: error.message });
  }
};

 
export const deleteVendorController = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }
    const result = await deleteVendor(req.params.id);

    res.status(200).json({ message: "Vendor deleted successfully"});
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error deleting vendor", error: error.message });
  }
};
