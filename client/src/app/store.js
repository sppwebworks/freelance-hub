import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import jobsReducer from "../features/jobs/jobsSlice";
import savedReducer from "../features/saved/savedSlice";
import applicationsReducer from "../features/applications/applicationsSlice";
import filtersReducer from "../features/filters/filtersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    saved: savedReducer,
    applications: applicationsReducer,
    filters: filtersReducer,
  },
});
