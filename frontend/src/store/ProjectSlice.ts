import { createSlice } from "@reduxjs/toolkit";
import { setLoading } from "./loader";
import { service } from "../shared/_services/api_service";

const initialState = {
    isLoading: false,
    error: "",
    projects: [],
    selectedProject: null,
    successMessage: ""
};

export const projectSlice = createSlice({
    name: "project",
    initialState,
    reducers: {
        setProjectData(state, { payload }) {
            state.projects = payload.result;
            state.isLoading = false;
            state.error = "";
        },
        addProject(state, { payload }) {
            state.projects.push(payload);
            state.successMessage = "Project Created successfully";
        },
        setSelectedProject(state, { payload }) {
            state.selectedProject = payload;
            state.isLoading = false;
            state.error = "";
        },
        updateProjectInList(state, { payload }) {
            const index = state.projects.findIndex(i => i._id === payload._id);
            if (index !== -1) {
                state.projects[index] = payload;
            }
            state.successMessage = "Project updated successfully";
        },
        removeProject(state, { payload }) {
            state.projects = state.projects.filter(i => i._id !== payload);
            state.successMessage = "Project Deleted successfully";
        },
        setError(state, { payload }) {
            state.error = payload;
            state.isLoading = false;
        }
    },
});

export const { setProjectData, addProject, setSelectedProject, updateProjectInList, removeProject, setError } = projectSlice.actions;
export default projectSlice.reducer;

 
export function getProjectList() {
    return async function getProjectThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.getAllProject();
            if (response.data) {
                dispatch(setProjectData(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error fetching projects"));
            console.error("Error in fetching Project", error);
        }
    };
}
 
export function createProject(projectData) {
    return async function createProjectThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.createProject(projectData);
            if (response.data) {
                dispatch(addProject(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error creating project"));
            console.error("Error in creating Project", error);
        }
    };
}
 
export function getProjectById(id) {
    return async function getProjectByIdThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.getProjectById(id);
            if (response.data) {
                dispatch(setSelectedProject(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error fetching project"));
            console.error("Error in fetching Project by ID", error);
        }
    };
}
 
export function updateProject(id, projectData) {
    return async function updateProjectThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.updateProject(id, projectData);
            if (response.data) {
                dispatch(updateProjectInList(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error updating project"));
            console.error("Error in updating Project", error);
        }
    };
}
 
export function deleteProject(id) {
    return async function deleteProjectThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            await service.deleteProject(id);
            dispatch(removeProject(id));
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error deleting project"));
            console.error("Error in deleting Project", error);
        }
    };
}