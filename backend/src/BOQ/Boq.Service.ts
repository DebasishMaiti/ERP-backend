 import Boq from "./Boq.model";

export const createBoq = async (project: string, name: string, description:string, notes:string, items:[], status:string)=>{
    const result = await Boq.create({
        project, name, description, notes, items, status
    })
    return result;
}
export const getAllBoq = async ()=>{
    return await Boq.find({ status: { $ne: "deleted" } });
    
}

export const getBoqByProject = async (id:string)=>{
    return await Boq.find({project:id})
}

export const getDraftBoq = async ()=>{
    return await Boq.find({ status: "draft" });
    
}
export const getConfirmedBoq = async ()=>{
    return await Boq.find({ status: "confirmed"  });
    
}
export const getActiveBoq = async ()=>{
    return await Boq.find({ status: "active" });
    
}
export const getBoqById = async (id : String)=>{
       const result = await Boq.findOne({boqId:id});
    return result;
}
export const updateBoq = async (project: string, name: string, description:string, notes:string, items:[], status:string, id:string,)=>{
        const result = await Boq.findByIdAndUpdate(id,{
        project, name, description, notes, items, status
    })
    return result;
}
export const deleteBoq = async (id:String)=>{
    const result = await Boq.findByIdAndUpdate(id,{status:"deleted"});
    return result;
}