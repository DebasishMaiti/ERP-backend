import Indent from "./Indent.Model";

export const createIndent = async (
  project: string,
  boq: string,
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

export const getIndents = async () => {
  const result = await Indent.find()
 
  return result;
};

export const getIndentById = async (id: string) => {
  const result = await Indent.findById(id)
 
  return result;
};

export const updateIndent = async (
  project: string,
  boq: string,
  title: string,
  location: string,
  neededBy: Date,
  requester: string,
  notes: string,
  items: any[],
  id: string,
  status: string,
  comment: string
) => {
  const result = await Indent.findByIdAndUpdate(
    id,
    { project, boq, title, location, neededBy, requester, notes, items, status, comment },
    { new: true }
  )
  
  return result;
};

export const deleteIndent = async (id: string) => {
  const result = await Indent.findByIdAndDelete(id);
  return result;
};
