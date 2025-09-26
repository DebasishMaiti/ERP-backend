 import Boq from "./Boq.model";

export const createBoq = async (project: String, name: String, description:String, notes:String, items:[], status:String)=>{
    const result = await Boq.create({
        project, name, description, notes, items, status
    })
    return result;
}
export const getAllBoq = async ()=>{
    return await Boq.find({ status: { $ne: "deleted" } });
    
}
export const getDraftBoq = async ()=>{
    return await Boq.find({ status: "draft" });
    
}
export const getConfirmedBoq = async ()=>{
    return await Boq.find({ status: "comfimed"  });
    
}
export const getActiveBoq = async ()=>{
    return await Boq.find({ status: "active" });
    
}
export const getBoqById = async (id : String)=>{
       const result = await Boq.findOne({boqId:id});
    return result;
}
export const updateBoq = async (project: String, boqName: String, description:String, notes:String, items:[], id:String, status:String)=>{
        const result = await Boq.findByIdAndUpdate(id,{
        project, boqName, description, notes, items, status
    })
    return result;
}
export const deleteBoq = async (id:String)=>{
    const result = await Boq.findByIdAndUpdate(id,{status:"deleted"});
    return result;
}