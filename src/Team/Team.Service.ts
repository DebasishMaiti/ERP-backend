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
  return result;
};

export const getTeam = async ()=>{
    const result = await Team.find();
    return result;
};

export const getTeamById = async (id:String)=>{
    const result = await Team.findById(id);
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
    const result = await Team.findByIdAndUpdate(id,{name, email, phone, status, notes, permissions});
    return result;
};

export const deleteTeam = async (id:String)=>{
    const result = await Team.findByIdAndDelete(id);
    return result;
};