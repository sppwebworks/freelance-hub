/**
 * ============================================================
 * JOB DETAIL PAGE — BULLETPROOF OWNERSHIP CHECK
 * ============================================================
 *
 * FIXES:
 * - Multi-fallback ID extraction (handles every backend shape)
 * - Explicit debug overlay (bottom-left) so you SEE the values
 * - Client always sees "View Applications" on own jobs
 * - Freelancer always sees "Apply Now" on others' jobs
 * ============================================================
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchJobById,
  toggleSaveJob,
  clearCurrent,
} from "../features/jobs/jobsSlice";
import { useToast } from "../context/ToastContext";
import ApplyModal from "../components/jobs/ApplyModal";

// ============================================================
// ROBUST ID EXTRACTOR
// Handles: string, ObjectId, populated object, populated _id
// ============================================================
const extractId = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  // Mongoose ObjectId has .toString() → hex string
  if (val._id) return extractId(val._id);
  if (val.id) return String(val.id);
  try {
    return String(val);
  } catch {
    return "";
  }
};

const JobDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const job = useSelector((s) => s.jobs.current);
  const { user, token } = useSelector((s) => s.auth);

  const [showApply, setShowApply] = useState(false);

  // ------------------------------------------------------------
  // Fetch job
  // ------------------------------------------------------------
  useEffect(() => {
    dispatch(fetchJobById(id));
    return () => dispatch(clearCurrent());
  }, [id, dispatch]);

  // ------------------------------------------------------------
  // Ownership (multi-fallback)
  // ------------------------------------------------------------
  const postedById = extractId(job?.postedBy);
  const currentUserId = extractId(user?._id);

  const isOwner = Boolean(
    user &&
    token &&
    postedById &&
    currentUserId &&
    postedById === currentUserId,
  );

  const isClient = user?.role === "client";
  const isFreelancer = user?.role === "freelancer";
  const canApply =
    Boolean(token) && !isOwner && isFreelancer && job?.status !== "closed";

  // ------------------------------------------------------------
  // Debug overlay
  // ------------------------------------------------------------
  const debugInfo = {
    postedById: postedById || "(none)",
    currentUserId: currentUserId || "(none)",
    isOwner,
    role: user?.role || "GUEST",
    applicants: job?.applicantsCount ?? "?",
    match: postedById === currentUserId ? "✅" : "❌",
  };

  // ------------------------------------------------------------
  // Loading
  // ------------------------------------------------------------
  if (!job) {
    return (
      <div className="status">
        <div className="spinner" />
        <p>Loading job...</p>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Formatters
  // ------------------------------------------------------------
  const budgetText = () => {
    const min = job.budgetMin || 0;
    const max = job.budgetMax || 0;
    if (!min && !max) return "Budget not specified";
    if (job.budgetType === "hourly") return `$${min}-${max}/hr`;
    return `$${min.toLocaleString()}-${max.toLocaleString()}`;
  };

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const handleSave = () => {
    if (!token) return navigate("/login");
    dispatch(toggleSaveJob(job._id))
      .unwrap()
      .then((r) => showToast(r.saved ? "Saved" : "Removed", "success"))
      .catch(() => showToast("Failed to save", "error"));
  };

  const handleApply = () => {
    if (!token) return navigate("/login");
    if (isClient) return showToast("Clients cannot apply", "error");
    if (isOwner) return showToast("You own this job", "error");
    if (job.status === "closed") return showToast("Job closed", "error");
    setShowApply(true);
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className="job-detail-page">
      {/* ============ DEBUG OVERLAY (remove in production) ============ */}
      <div
        style={{
          position: "fixed",
          bottom: 10,
          left: 10,
          padding: "8px 12px",
          background: "#000",
          color: "#0f0",
          fontSize: 11,
          fontFamily: "monospace",
          borderRadius: 6,
          zIndex: 99999,
          lineHeight: 1.6,
          maxWidth: 400,
          wordBreak: "break-all",
        }}
      >
        <strong>🔍 DEBUG</strong>
        <br />
        postedById: {debugInfo.postedById}
        <br />
        currentUserId: {debugInfo.currentUserId}
        <br />
        match: {debugInfo.match} | isOwner: {String(debugInfo.isOwner)}
        <br />
        role: {debugInfo.role} | applicants: {debugInfo.applicants}
      </div>

      <Link to="/" className="back-link">
        ← Back to jobs
      </Link>

      {/* ============== HEADER ============== */}
      <div className="job-detail-header">
        <div className="job-company-logo large">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} />
          ) : (
            <span>{job.company?.[0]?.toUpperCase() || "?"}</span>
          )}
        </div>

        <div className="job-detail-title">
          <h1>{job.title}</h1>
          <p className="company">{job.company}</p>

          <div className="job-detail-meta">
            <span>📍 {job.location}</span>
            <span>💼 {job.experienceLevel}</span>
            <span>💰 {budgetText()}</span>
            <span>👥 {job.applicantsCount || 0} applicants</span>
            {job.status === "closed" && (
              <span style={{ color: "var(--danger)" }}>🔒 Closed</span>
            )}
          </div>
        </div>
      </div>

      {/* ============== ACTIONS ============== */}
      <div className="job-detail-actions">
        {isOwner ? (
          <Link
            to={`/jobs/${job._id}/applications`}
            className="btn-primary btn-large"
          >
            📥 View Applications ({job.applicantsCount || 0})
          </Link>
        ) : canApply ? (
          <button className="btn-primary btn-large" onClick={handleApply}>
            Apply Now
          </button>
        ) : isClient ? (
          <button
            className="btn-ghost btn-large"
            disabled
            title="Only freelancers can apply to jobs"
          >
            🚫 Clients can't apply
          </button>
        ) : !token ? (
          <button
            className="btn-primary btn-large"
            onClick={() => navigate("/login")}
          >
            Login to Apply
          </button>
        ) : (
          <button className="btn-ghost btn-large" disabled>
            Not available
          </button>
        )}

        <button className="btn-ghost btn-large" onClick={handleSave}>
          {job.isSaved ? "❤️ Saved" : "🤍 Save"}
        </button>
      </div>

      {/* ============== DESCRIPTION ============== */}
      <section className="job-detail-section">
        <h2>Description</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {job.description || "No description provided."}
        </p>
      </section>

      {/* ============== SKILLS ============== */}
      {job.skills?.length > 0 && (
        <section className="job-detail-section">
          <h2>Required Skills</h2>
          <div className="job-card-skills">
            {job.skills.map((s) => (
              <span key={s} className="skill-tag skill-tag-large">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ============== BUDGET ============== */}
      <section className="job-detail-section">
        <h2>Budget & Details</h2>
        <div className="job-detail-meta">
          <span>
            💰 <strong>{budgetText()}</strong>
          </span>
          <span>
            📊 {job.budgetType === "hourly" ? "Hourly" : "Fixed price"}
          </span>
          <span>🎯 {job.experienceLevel} level</span>
          {job.isRemote && <span>🌍 Remote</span>}
        </div>
      </section>

      <ApplyModal
        isOpen={showApply}
        onClose={() => setShowApply(false)}
        job={job}
      />
    </div>
  );
};

export default JobDetail;
