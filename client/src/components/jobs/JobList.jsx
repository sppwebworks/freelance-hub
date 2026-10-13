import JobCard from "./JobCard";
import SkeletonJob from "./SkeletonJob";

const JobList = ({ jobs, loading }) => {
  if (loading) {
    return (
      <div className="job-list">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonJob key={i} />
        ))}
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="empty-state">
        <div className="empty-emoji">🔍</div>
        <h3>No jobs found</h3>
        <p>Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="job-list">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  );
};

export default JobList;
