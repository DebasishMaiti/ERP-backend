import { createSlice } from "@reduxjs/toolkit";
import { setLoading } from "./loader";
import { service } from "../shared/_services/api_service";

const initialState = {
    isLoading: false,
    error: "",
    teams: [],
    selectedTeam: null,
    successMessage: ""
};

export const teamSlice = createSlice({
    name: "team",
    initialState,
    reducers: {
        setTeamData(state, { payload }) {
            state.teams = payload.result;
            state.isLoading = false;
            state.error = "";
        },
        addTeam(state, { payload }) {
            state.teams.push(payload);
            state.successMessage = "Team Created successfully";
        },
        setSelectedTeam(state, { payload }) {
            state.selectedTeam = payload;
            state.isLoading = false;
            state.error = "";
        },
        updateTeamInList(state, { payload }) {
            const index = state.teams.findIndex(i => i._id === payload._id);
            if (index !== -1) {
                state.teams[index] = payload;
            }
            state.successMessage = "Team updated successfully";
        },
        removeTeam(state, { payload: id }) {
            state.teams = state.teams.filter(i => i._id !== id);
            state.successMessage = "Team Deleted successfully";
        },
        setError(state, { payload }) {
            state.error = payload;
            state.isLoading = false;
        }
    },
});

export const { setTeamData, addTeam, setSelectedTeam, updateTeamInList, removeTeam, setError } = teamSlice.actions;
export default teamSlice.reducer;
 

export function getTeamList() {
    return async function getTeamThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.getAllTeam();
            if (response.data) {
                dispatch(setTeamData(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error fetching teams"));
            console.error("Error in fetching Team", error);
        }
    };
}

export function createTeam(teamData) {
    return async function createTeamThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.createTeam(teamData);
            if (response.data) {
                dispatch(addTeam(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error creating team"));
            console.error("Error in creating Team", error);
        }
    };
}

export function getTeamById(id) {
    return async function getTeamByIdThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.getTeamById(id);
            if (response.data) {
                dispatch(setSelectedTeam(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error fetching team"));
            console.error("Error in fetching Team by ID", error);
        }
    };
}

export function updateTeam(id, teamData) {
    return async function updateTeamThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.updateTeam(id, teamData);
            if (response.data) {
                dispatch(updateTeamInList(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error updating team"));
            console.error("Error in updating Team", error);
        }
    };
}

export function deleteTeam(id) {
    return async function deleteTeamThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            await service.deleteTeam(id);
            dispatch(removeTeam(id));
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error deleting team"));
            console.error("Error in deleting Team", error);
        }
    };
}