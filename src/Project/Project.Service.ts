import Project from "./Project.Model";
 
export const createProject = async (
  name: string,
  projectCode: string,
  location: String,
  startDate: Date,
  targetCompletionDate: Date,
  status: string,
  notes: string,
  employees: string[]
) => {
  const result = await Project.create({
    name,
    projectCode,
    location,
    startDate,
    targetCompletionDate,
    status,
    notes,
    employees,
  });
  return result;
};
 
export const getProject = async () => {
  const result = await Project.find();
  return result;
};

 
export const getProjectById = async (id: string) => {
  const result = await Project.findById(id);
  return result;
};

 
export const updateProject = async (
  name: string,
  projectCode: string,
  location: string,
  startDate: Date,
  
  targetCompletionDate: Date,
  status: string,
  notes: string,
  employees: string[],
  id: string
) => {
  const result = await Project.findByIdAndUpdate(id,{ name, projectCode, location, startDate,  targetCompletionDate, status, notes, employees },
    { new: true, runValidators: true }
  );
  return result;
};




export const deleteProject = async (id: string) => {
  const result = await Project.findByIdAndDelete(id);
  return result;
};
