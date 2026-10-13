import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleSaveJob } from "../../features/jobs/jobsSlice";
import { useToast } from "../../context/ToastContext";

const JobCard = ({ job }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const token = useSelector((s) => s.auth.token);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return showToast("Login to save jobs", "error");
    dispatch(toggleSaveJob(job._id))
      .unwrap()
      .then((res) => showToast(res.saved ? "Saved" : "Removed", "success"))
      .catch((err) => showToast(err || "Failed", "error"));
  };

  const budgetText = () => {
    if (job.budgetType === "hourly")
      return `$${job.budgetMin}-${job.budgetMax}/hr`;
    return `$${job.budgetMin.toLocaleString()}-${job.budgetMax.toLocaleString()}`;
  };

  return (
    <Link to={`/jobs/${job._id}`} className="job-card">
      <div className="job-card-header">
        <div className="job-company-logo">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} />
          ) : (
            <span>{job.company?.[0]?.toUpperCase()}</span>
          )}
        </div>
        <div className="job-card-title">
          <h3>{job.title}</h3>
          <p>{job.company}</p>
        </div>
        <button
          className={`save-btn ${job.isSaved ? "saved" : ""}`}
          onClick={handleSave}
        >
          {job.isSaved ? "❤️" : "🤍"}
        </button>
      </div>

      <p className="job-card-desc">
        {job.description.length > 120
          ? job.description.slice(0, 120) + "..."
          : job.description}
      </p>

      <div className="job-card-skills">
        {job.skills.slice(0, 4).map((s) => (
          <span key={s} className="skill-tag">
            {s}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="skill-tag">+{job.skills.length - 4}</span>
        )}
      </div>

      <div className="job-card-footer">
        <span className="job-budget">{budgetText()}</span>
        <span className="job-meta">
          {job.isRemote && "🌍 Remote"} · {job.experienceLevel}
        </span>
      </div>
    </Link>
  );
};

export default JobCard;
