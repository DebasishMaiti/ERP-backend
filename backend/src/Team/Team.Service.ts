import  Team  from "./Team.Model";

export const createTeam = async (
  name: string,
  email: string,
  phone: string,
  status: "active" | "inactive",
  notes: string,
  permissions: any
) => {
  const result = await Team.create({
    name,
    email,
    phone,
    status,
    notes,
    permissions,
  });
  console.log("xsxsx",result);
  
  return result;
};

export const getAllTeam = async ()=>{
   return await Team.find({ status: { $ne: "deleted" } });
     
};

export const getActiveTeam = async ()=>{
   return await Team.find({ status: "active" });
     
};
export const getInactiveTeam = async ()=>{
   return await Team.find({ status: "inactive" });
     
};

export const getTeamById = async (id:String)=>{
    const result = await Team.findOne({teamId:id});
    return result;
};

export const updateTeam = async (  name: string,
  email: string,
  phone: string,
  status: "active" | "inactive",
  notes: string,
  permissions: any,
  id:string
)=>{
    const result = await Team.findOneAndUpdate({teamId:id},{name, email, phone, status, notes, permissions});
    return result;
};

export const deleteTeam = async (id:String)=>{
    const result = await Team.findByIdAndUpdate({teamId:id},{status:"deleted"});
    return result;
};