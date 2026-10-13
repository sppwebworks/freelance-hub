import { createSlice } from "@reduxjs/toolkit";

const filtersSlice = createSlice({
  name: "filters",
  initialState: {
    search: "",
    category: "",
    skills: [],
    budgetMin: 0,
    budgetMax: 0,
    experienceLevel: "",
    isRemote: false,
    sortBy: "recent",
    sidebarOpen: false,
  },
  reducers: {
    setSearch: (s, a) => {
      s.search = a.payload;
    },
    setCategory: (s, a) => {
      s.category = a.payload;
    },
    toggleSkill: (s, a) => {
      const skill = a.payload;
      s.skills = s.skills.includes(skill)
        ? s.skills.filter((x) => x !== skill)
        : [...s.skills, skill];
    },
    setBudget: (s, a) => {
      s.budgetMin = a.payload.min;
      s.budgetMax = a.payload.max;
    },
    setExperienceLevel: (s, a) => {
      s.experienceLevel = a.payload;
    },
    toggleRemote: (s) => {
      s.isRemote = !s.isRemote;
    },
    setSortBy: (s, a) => {
      s.sortBy = a.payload;
    },
    toggleSidebar: (s) => {
      s.sidebarOpen = !s.sidebarOpen;
    },
    resetFilters: (s) => ({
      ...s,
      search: "",
      category: "",
      skills: [],
      budgetMin: 0,
      budgetMax: 0,
      experienceLevel: "",
      isRemote: false,
    }),
  },
});

export const {
  setSearch,
  setCategory,
  toggleSkill,
  setBudget,
  setExperienceLevel,
  toggleRemote,
  setSortBy,
  toggleSidebar,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
