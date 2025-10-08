import { createSlice } from '@reduxjs/toolkit';
import { setLoading } from './loader';
import { service } from '../shared/_services/api_service';

const initialState = {
  isLoading: false,
  error: "",
  items: [],
  selectedItem: null,
  successMessage: "",
};

export const itemSlice = createSlice({
  name: "item",
  initialState,
  reducers: {
    setItemData(state, { payload }) {
      state.items = payload?.result || payload || [];
      state.isLoading = false;
      state.error = "";
    },
    addItem(state, { payload }) {
      state.items.push(payload);
      state.successMessage = "Item created successfully!";
    },
    setSelectedItem(state, { payload }) {
      state.selectedItem = payload;
      state.isLoading = false;
      state.error = "";
    },
    updateItemInList(state, { payload }) {
      const index = state.items.findIndex(i => i._id === payload._id);
      if (index !== -1) {
        state.items[index] = payload;
      }
      state.successMessage = "Item updated successfully!";
    },
    removeItem(state, { payload: id }) {
      state.items = state.items.filter(i => i._id !== id);
      state.successMessage = "Item deleted successfully!";
    },
  },
});

export const {
  setItemData,
  addItem,
  setSelectedItem,
  updateItemInList,
  removeItem,
} = itemSlice.actions;

export default itemSlice.reducer;

 

export function getItemList() {
  return async function getItemThunk(dispatch) {
    try {
      dispatch(setLoading(true));
      const response = await service.getAllItem();
      if (response.data) dispatch(setItemData(response.data));
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };
}

export function createItem(data) {
  return async function createItemThunk(dispatch) {
    try {
      dispatch(setLoading(true));
      const response = await service.createItem(data);
      if (response.data) dispatch(addItem(response.data));
    } catch (err) {
      console.error("Error creating item:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };
}

export function getItemById(id) {
  return async function getItemByIdThunk(dispatch) {
    try {
      dispatch(setLoading(true));
      const response = await service.getItemById(id);
      if (response.data) dispatch(setSelectedItem(response.data));
    } catch (err) {
      console.error("Error fetching item by ID:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };
}

export function updateItem(id, data) {
  return async function updateItemThunk(dispatch) {
    try {
      dispatch(setLoading(true));
      const response = await service.UpdateItem(id, data);
      if (response.data) dispatch(updateItemInList(response.data));
    } catch (err) {
      console.error("Error updating item:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };
}

export function deleteItem(id) {
  return async function deleteItemThunk(dispatch) {
    try {
      dispatch(setLoading(true));
      const response = await service.deleteItem(id);
      if (response.data) dispatch(removeItem(id));
    } catch (err) {
      console.error("Error deleting item:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };
}
