import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchJobs = createAsyncThunk(
  "jobs/fetch",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/jobs", { params });
      return data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to load jobs",
      );
    }
  },
);

export const fetchJobById = createAsyncThunk(
  "jobs/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const fetchFilterCounts = createAsyncThunk(
  "jobs/fetchCounts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/jobs/filters");
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const toggleSaveJob = createAsyncThunk(
  "jobs/toggleSave",
  async (jobId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/saved/${jobId}`);
      return { jobId, saved: data.saved };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState: {
    items: [],
    current: null,
    counts: null,
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pages: 1,
  },
  reducers: {
    clearCurrent: (s) => {
      s.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchJobs.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.jobs;
        s.total = a.payload.total;
        s.page = a.payload.page;
        s.pages = a.payload.pages;
      })
      .addCase(fetchJobs.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchJobById.fulfilled, (s, a) => {
        s.current = a.payload;
      })

      .addCase(fetchFilterCounts.fulfilled, (s, a) => {
        s.counts = a.payload;
      })

      .addCase(toggleSaveJob.fulfilled, (s, a) => {
        const { jobId, saved } = a.payload;
        const job = s.items.find((j) => j._id === jobId);
        if (job) job.isSaved = saved;
        if (s.current?._id === jobId) s.current.isSaved = saved;
      });
  },
});

export const { clearCurrent } = jobsSlice.actions;
export default jobsSlice.reducer;
