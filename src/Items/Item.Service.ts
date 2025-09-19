import Item from "./Item.Model";

export const createItem = async (name: string, unit: string, vendors: any[]) => {
  const result = await Item.create({ name, unit, vendors });
  return result;
};

export const getItems = async () => {
  return await Item.find();
};

export const getItemById = async (id: string) => {
  return await Item.findById(id);
};
 
export const updateItem = async (id: string, name: string, unit: string, vendors: any[]) => {
  const result = await Item.findByIdAndUpdate(
    id,
    { name, unit, vendors },
    { new: true }
  );
  return result;
};

export const deleteItem = async (id: string) => {
  return await Item.findByIdAndDelete(id);
};