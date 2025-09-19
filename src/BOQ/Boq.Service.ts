 import Boq from "./Boq.model";

export const createBoq = async (project: String, boqName: String, description:String, notes:String, items:[], status:String)=>{
    const result = await Boq.create({
        project, boqName, description, notes, items, status
    })
    return result;
}
export const getBoq = async ()=>{
    const result = await Boq.find();
    return result;
}
export const getBoqById = async (id : String)=>{
       const result = await Boq.findById(id);
    return result;
}
export const updateBoq = async (project: String, boqName: String, description:String, notes:String, items:[], id:String, status:String)=>{
        const result = await Boq.findByIdAndUpdate(id,{
        project, boqName, description, notes, items, status
    })
    return result;
}
export const deleteBoq = async (id:String)=>{
    const result = await Boq.findByIdAndDelete(id);
    return result;
}