import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSaved } from "../features/saved/savedSlice";
import JobCard from "../components/jobs/JobCard";

const Saved = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.saved);

  useEffect(() => {
    dispatch(fetchSaved());
  }, [dispatch]);

  return (
    <div className="page">
      <h1>❤️ Saved Jobs</h1>
      {loading && <p className="status">Loading...</p>}
      {!loading && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">📌</div>
          <h3>No saved jobs yet</h3>
          <p>Tap the heart icon on jobs to save them.</p>
        </div>
      )}
      <div className="job-list">
        {items.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default Saved;
