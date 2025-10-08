import { createSlice } from "@reduxjs/toolkit";
import { setLoading } from "./loader";
import { service } from "../shared/_services/api_service";

const initialState = {
    isLoading: false,
    error: "",
    reports: [],
    successMessage: ""
};

export const reportSlice = createSlice({
    name: "report",
    initialState,
    reducers: {
        setReportData(state, { payload }) {
            state.reports = payload.result;
            state.isLoading = false;
            state.error = "";
        },
        setError(state, { payload }) {
            state.error = payload;
            state.isLoading = false;
        }
    },
});

export const { setReportData, setError } = reportSlice.actions;
export default reportSlice.reducer;

 
export function getReportList() {
    return async function getReportThunk(dispatch) {
        try {
            dispatch(setLoading(true));
            const response = await service.getReport();
            if (response.data) {
                dispatch(setReportData(response.data));
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.response?.data?.message || "Error fetching reports"));
            console.error("Error in fetching Report", error);
        }
    };
}