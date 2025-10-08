import { createSlice } from '@reduxjs/toolkit';
import { setLoading } from './loader';
import { service } from '../shared/_services/api_service';

const initialState = {
  isLoading: false,
  error: "",
  vendors: [],
  selectedVendor: null, 
  successMessage: "",
};

export const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    setVendorData(state, { payload }) {
      state.vendors = payload.result;
      state.isLoading = false;
      state.error = "";
    },
    addVendor(state, { payload }) {
      state.vendors.push(payload);
      state.successMessage = "Vendor created successfully!";
    },
    setSelectedVendor(state, { payload }) {
      state.selectedVendor = payload;
      state.isLoading = false;
      state.error = "";
    },
    updateVendorInList(state, { payload }) {
      const index = state.vendors.findIndex(v => v._id === payload._id);
      if (index !== -1) {
        state.vendors[index] = payload;
      }
      state.successMessage = "Vendor updated successfully!";
    }
  }
});

export const { setVendorData, addVendor, setSelectedVendor, updateVendorInList } = vendorSlice.actions;
export default vendorSlice.reducer;

 
export function getVendorList() {
  return async function getVendorThunk(dispatch) {
    try {
      dispatch(setLoading(true));
      const response = await service.getAllVendor();

      if (response.data) {
        dispatch(setVendorData(response.data));
      }

      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setLoading(false));
      console.error("Error fetching vendors:", err);
    }
  };
}
 
export function createVendor(data) {
  return async function createVendorThunk(dispatch) {
    try {
      dispatch(setLoading(true));
      const response = await service.createVendor(data);

      if (response.data) {
        dispatch(getVendorList());
      }

      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setLoading(false));
      console.error("Error creating vendor:", err);
    }
  };
}
 
export function getVendorById(id) {
  return async function getVendorByIdThunk(dispatch) {
    try {
      dispatch(setLoading(true));
      const response = await service.getVendorById(id);

      if (response.data) {
        dispatch(setSelectedVendor(response.data));
      }

      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setLoading(false));
      console.error("Error fetching vendor by ID:", err);
    }
  };
}
 
export function updateVendor(id, data) {
  return async function updateVendorThunk(dispatch) {
    try {
      dispatch(setLoading(true));
      const response = await service.UpdateVendor(id, data);

      if (response.data) {
        dispatch(updateVendorInList(response.data));
      }

      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setLoading(false));
      console.error("Error updating vendor:", err);
    }
  };
}
