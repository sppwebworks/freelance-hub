import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const applyToJob = createAsyncThunk(
  "applications/apply",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to submit application",
      );
    }
  },
);

export const fetchMyApplications = createAsyncThunk(
  "applications/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/applications/me");
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const fetchReceivedApplications = createAsyncThunk(
  "applications/fetchReceived",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/applications/received");
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const fetchJobApplications = createAsyncThunk(
  "applications/fetchForJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/applications/job/${jobId}`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const updateApplicationStatus = createAsyncThunk(
  "applications/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/applications/${id}/status`, { status });
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

const applicationsSlice = createSlice({
  name: "applications",
  initialState: {
    mine: [],
    received: [],
    forJob: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearForJob: (s) => {
      s.forJob = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyToJob.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(applyToJob.fulfilled, (s, a) => {
        s.loading = false;
        s.mine.unshift(a.payload);
      })
      .addCase(applyToJob.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchMyApplications.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchMyApplications.fulfilled, (s, a) => {
        s.loading = false;
        s.mine = a.payload;
      })
      .addCase(fetchMyApplications.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchReceivedApplications.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchReceivedApplications.fulfilled, (s, a) => {
        s.loading = false;
        s.received = a.payload.applications || a.payload || [];
      })
      .addCase(fetchReceivedApplications.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchJobApplications.fulfilled, (s, a) => {
        s.forJob = a.payload;
      })

      .addCase(updateApplicationStatus.fulfilled, (s, a) => {
        const rIndex = s.received.findIndex((x) => x._id === a.payload._id);
        if (rIndex !== -1) s.received[rIndex] = a.payload;

        const jIndex = s.forJob.findIndex((x) => x._id === a.payload._id);
        if (jIndex !== -1) s.forJob[jIndex] = a.payload;
      });
  },
});

export const { clearForJob } = applicationsSlice.actions;
export default applicationsSlice.reducer;
