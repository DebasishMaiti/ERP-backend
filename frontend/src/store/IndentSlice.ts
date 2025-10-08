import { createSlice } from "@reduxjs/toolkit";
import { setLoading } from "./loader";
import { service } from "../shared/_services/api_service";

const initialState = {
    isLoading: false,
    error: "",
    indents: [],
    selectedIndent: null,
    successMessage: ""
};

export const indentSlice = createSlice({
    name: "indent",
    initialState,
    reducers: {
        setIndentData(state, { payload }) {
            state.indents = payload.result;
            state.isLoading = false;
            state.error = "";
        },
        addIndent(state, { payload }) {
            state.indents.push(payload);
            state.successMessage = "Indent Created successfully";
        },
        setSelectedIndent(state, { payload }) {
            state.selectedIndent = payload;
            state.isLoading = false;
            state.error = "";
        },
        updateIndentInList(state, { payload }) {
            const index = state.indents.findIndex(i => i._id === payload._id);
            if (index !== -1) {
                state.indents[index] = payload;
            }
            state.successMessage = "Indent updated successfully";
        },
        removeIndent(state, { payload }) {
            state.indents = state.indents.filter(i => i._id !== payload);
            state.successMessage = "Indent Deleted successfully";
        },
        setError(state, { payload }) {
            state.error = payload;
            state.isLoading = false;
        }
    },
});

export const { setIndentData, addIndent, setSelectedIndent, updateIndentInList, removeIndent, setError } = indentSlice.actions;
export default indentSlice.reducer;

 
export function getIndentList() {
    return async function getIndentThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.getAllIndent();
            if (response.data) {
                dispatch(setIndentData(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error fetching indents"));
            console.error("Error in fetching Indent", error);
        }
    };
}
 
export function createIndent(indentData) {
    return async function createIndentThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.createIndent(indentData);
            if (response.data) {
                dispatch(addIndent(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error creating indent"));
            console.error("Error in creating Indent", error);
        }
    };
}
 
export function getIndentById(id) {
    return async function getIndentByIdThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.getIndentById(id);
            if (response.data) {
                dispatch(setSelectedIndent(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error fetching indent"));
            console.error("Error in fetching Indent by ID", error);
        }
    };
}
 
export function updateIndent(id, indentData) {
    return async function updateIndentThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.updateIndent(id, indentData);
            if (response.data) {
                dispatch(updateIndentInList(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error updating indent"));
            console.error("Error in updating Indent", error);
        }
    };
}
 
export function deleteIndent(id) {
    return async function deleteIndentThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            await service.deleteindent(id);
            dispatch(removeIndent(id));
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error deleting indent"));
            console.error("Error in deleting Indent", error);
        }
    };
}