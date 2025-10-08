import { createSlice } from "@reduxjs/toolkit";
import { setLoading } from "./loader";
import { service } from "../shared/_services/api_service";

const initialState = {
    isLoading: false,
    error: "",
    boqs: [],
    selectedBoq: null,
    successMessage: ""
};

export const boqSlice = createSlice({
    name: "boq",
    initialState,
    reducers: {
        setBoqData(state, { payload }) {
            state.boqs = payload.result;
            state.isLoading = false;
            state.error = "";
        },
        addBoq(state, { payload }) {
            state.boqs.push(payload);
            state.successMessage = "BOQ Created successfully";
        },
        setSelectedBoq(state, { payload }) {
            state.selectedBoq = payload;
            state.isLoading = false;
            state.error = "";
        },
        updateBoqInList(state, { payload }) {
            const index = state.boqs.findIndex(i => i._id === payload._id);
            if (index !== -1) {
                state.boqs[index] = payload;
            }
            state.successMessage = "BOQ updated successfully";
        },
        removeBoq(state, { payload }) {
            state.boqs = state.boqs.filter(i => i._id !== payload);
            state.successMessage = "BOQ Deleted successfully";
        },
        setError(state, { payload }) {
            state.error = payload;
            state.isLoading = false;
        }
    },
});

export const { setBoqData, addBoq, setSelectedBoq, updateBoqInList, removeBoq, setError } = boqSlice.actions;
export default boqSlice.reducer;

 
export function getBoqList() {
    return async function getBoqThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.getAllBoq();
            if (response.data) {
                dispatch(setBoqData(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error fetching BOQs"));
            console.error("Error in fetching BOQ", error);
        }
    };
}
 
export function createBoq(boqData) {
    return async function createBoqThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.createBoq(boqData);
            if (response.data) {
                dispatch(addBoq(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error creating BOQ"));
            console.error("Error in creating BOQ", error);
        }
    };
}
 
export function getBoqById(id) {
    return async function getBoqByIdThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.getBoqById(id);
            if (response.data) {
                dispatch(setSelectedBoq(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error fetching BOQ"));
            console.error("Error in fetching BOQ by ID", error);
        }
    };
}
 
export function updateBoq(id, boqData) {
    return async function updateBoqThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.updateBoq(id, boqData);
            if (response.data) {
                dispatch(updateBoqInList(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error updating BOQ"));
            console.error("Error in updating BOQ", error);
        }
    };
}
 
export function deleteBoq(id) {
    return async function deleteBoqThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            await service.deleteBoq(id);
            dispatch(removeBoq(id));
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error deleting BOQ"));
            console.error("Error in deleting BOQ", error);
        }
    };
}