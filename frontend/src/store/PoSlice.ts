import { createSlice } from "@reduxjs/toolkit";
import { setLoading } from "./loader";
import { service } from "../shared/_services/api_service";

const initialState = {
    isLoading: false,
    error: "",
    pos: [],
    selectedPo: null,
    successMessage: ""
};

export const poSlice = createSlice({
    name: "po",
    initialState,
    reducers: {
        setPoData(state, { payload }) {
            state.pos = payload.result;
            state.isLoading = false;
            state.error = "";
        },
        addPo(state, { payload }) {
            state.pos.push(payload);
            state.successMessage = "Purchase Order Created successfully";
        },
        setSelectedPo(state, { payload }) {
            state.selectedPo = payload;
            state.isLoading = false;
            state.error = "";
        },
        updatePoInList(state, { payload }) {
            const index = state.pos.findIndex(i => i._id === payload._id);
            if (index !== -1) {
                state.pos[index] = payload;
            }
            state.successMessage = "Purchase Order updated successfully";
        },
        removePo(state, { payload }) {
            state.pos = state.pos.filter(i => i._id !== payload);
            state.successMessage = "Purchase Order Deleted successfully";
        },
        setError(state, { payload }) {
            state.error = payload;
            state.isLoading = false;
        }
    },
});

export const { setPoData, addPo, setSelectedPo, updatePoInList, removePo, setError } = poSlice.actions;
export default poSlice.reducer;

 
export function getPoList() {
    return async function getPoThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.getAllPo();
            if (response.data) {
                dispatch(setPoData(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error fetching purchase orders"));
            console.error("Error in fetching Purchase Order", error);
        }
    };
}
 
export function createPo(poData) {
    return async function createPoThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.createPo(poData);
            if (response.data) {
                dispatch(addPo(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error creating purchase order"));
            console.error("Error in creating Purchase Order", error);
        }
    };
}
 
export function getPoById(id) {
    return async function getPoByIdThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.getPoById(id);
            if (response.data) {
                dispatch(setSelectedPo(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error fetching purchase order"));
            console.error("Error in fetching Purchase Order by ID", error);
        }
    };
}
 
export function updatePo(id, poData) {
    return async function updatePoThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.updatePo(id, poData);
            if (response.data) {
                dispatch(updatePoInList(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error updating purchase order"));
            console.error("Error in updating Purchase Order", error);
        }
    };
}
 
export function deletePo(id) {
    return async function deletePoThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            await service.deletePo(id);
            dispatch(removePo(id));
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error deleting purchase order"));
            console.error("Error in deleting Purchase Order", error);
        }
    };
}