import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchSaved = createAsyncThunk(
  "saved/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/saved");
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

const savedSlice = createSlice({
  name: "saved",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSaved.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchSaved.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchSaved.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export default savedSlice.reducer;
