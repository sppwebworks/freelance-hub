import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobs } from "../features/jobs/jobsSlice";
import { toggleSidebar } from "../features/filters/filtersSlice";
import FilterSidebar from "../components/filters/FilterSidebar";
import SearchBar from "../components/filters/SearchBar";
import JobList from "../components/jobs/JobList";

const Home = () => {
  const dispatch = useDispatch();
  const filters = useSelector((s) => s.filters);
  const { items, loading, total, page } = useSelector((s) => s.jobs);

  useEffect(() => {
    dispatch(
      fetchJobs({
        search: filters.search || undefined,
        category: filters.category || undefined,
        skills: filters.skills.length ? filters.skills.join(",") : undefined,
        budgetMin: filters.budgetMin || undefined,
        budgetMax: filters.budgetMax || undefined,
        experienceLevel: filters.experienceLevel || undefined,
        isRemote: filters.isRemote ? "true" : undefined,
        sortBy: filters.sortBy,
        page,
        limit: 20,
      }),
    );
  }, [
    dispatch,
    filters.search,
    filters.category,
    filters.skills.join(","),
    filters.budgetMin,
    filters.budgetMax,
    filters.experienceLevel,
    filters.isRemote,
    filters.sortBy,
    page,
  ]);

  return (
    <div className="home-layout">
      <FilterSidebar onClose={() => dispatch(toggleSidebar())} />
      {filters.sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <main className="main-content">
        <SearchBar />
        <div className="results-header">
          <h2>
            {total} job{total !== 1 ? "s" : ""} found
          </h2>
        </div>
        <JobList jobs={items} loading={loading} />
      </main>
    </div>
  );
};

export default Home;
