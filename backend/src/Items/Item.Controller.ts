import { Request, Response } from "express";
import mongoose from "mongoose";
import { 
  createItem, 
  getItems, 
  getItemById, 
  updateItem, 
  deleteItem
} from "./Item.Service";

export const createItemController = async (req: Request, res: Response) => {
  try {
    const { name, unit, vendors } = req.body;
      
    if (!name || !unit || !Array.isArray(vendors) || vendors.length === 0) {
      return res.status(400).json({ message: "Please provide name, unit and at least one vendor entry" });
    }

    const result = await createItem(name, unit, vendors);
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: "Error creating item", error });
  }
};

export const getItemsController = async (req: Request, res: Response) => {
  try {
    const result = await getItems();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving items", error });
  }
};

export const getItemByIdController = async (req: Request, res: Response) => {
  try {
    const result = await getItemById(req.params.itemId);
    if (!result) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving item", error });
  }
};
 
export const updateItemController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, unit, vendors } = req.body;

    if (!name || !unit || !Array.isArray(vendors) || vendors.length === 0) {
      return res.status(400).json({ message: "Please provide name, unit and at least one vendor entry" });
    }

    const result = await updateItem(id, name, unit, vendors);
    if (!result) {
      return res.status(404).json({ message: "Item not found or deleted" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating item", error });
  }
};

export const deleteItemController = async (req: Request, res: Response) => {
  try {
    const result = await deleteItem(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error });
  }
};