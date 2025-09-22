import Item from "./Item.Model";

export const createItem = async (name: string, unit: string, vendors: any[]) => {
  const result = await Item.create({ name, unit, vendors });
  return result;
};

export const getItems = async () => {
  return await Item.find({ status: { $ne: "deleted" } });
};

export const getItemById = async (itemId: string) => {
  return await Item.findOne({ itemId, status: { $ne: "deleted" } });
};
 
export const updateItem = async (id: string, name: string, unit: string, vendors: any[]) => {
  return await Item.findByIdAndUpdate(
     id ,
    { name, unit, vendors },
    { new: true  }
  );
};
 
export const deleteItem = async (itemId: string) => {
  return await Item.findOneAndUpdate(
    { itemId, status: { $ne: "deleted" } },
    { status: "deleted" },
    { new: true }
  );
};