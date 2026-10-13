/**
 * ============================================================
 * JOB APPLICATIONS PAGE (Client View)
 * ============================================================
 *
 * Shows all applications received for a specific job.
 * Only accessible to the job poster.
 *
 * FIXED:
 * - ObjectId vs string comparison for ownership check
 * - Debug logs to help diagnose issues
 * - Loading + error states
 * ============================================================
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobById } from "../features/jobs/jobsSlice";
import {
  fetchJobApplications,
  updateApplicationStatus,
} from "../features/applications/applicationsSlice";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

const STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "hired"];

const STATUS_COLORS = {
  pending: "#f2d600",
  reviewed: "#0079bf",
  shortlisted: "#61bd4f",
  rejected: "#eb5a46",
  hired: "#9c27b0",
};

// Helper: safely convert any ID to string
const toIdString = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val.toString) return val.toString();
  return String(val);
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const JobApplications = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const job = useSelector((s) => s.jobs.current);
  const { forJob: applications, loading } = useSelector((s) => s.applications);
  const { user } = useSelector((s) => s.auth);

  const [expanded, setExpanded] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ------------------------------------------------------------
  // Fetch job + applications on mount
  // ------------------------------------------------------------
  useEffect(() => {
    dispatch(fetchJobById(jobId));
    dispatch(fetchJobApplications(jobId));
  }, [dispatch, jobId]);

  // ------------------------------------------------------------
  // Ownership check (React-safe)
  // ------------------------------------------------------------
  const postedById = toIdString(job?.postedBy?._id || job?.postedBy);
  const currentUserId = toIdString(user?._id);
  const isOwner = Boolean(
    job && user && postedById && currentUserId && postedById === currentUserId,
  );

  // Debug log
  useEffect(() => {
    if (job && user) {
      console.log("🔍 JobApplications ownership:", {
        jobTitle: job.title,
        postedById,
        currentUserId,
        isOwner,
        applicationsCount: applications.length,
      });
      setAuthChecked(true);
    }
  }, [job, user, postedById, currentUserId, isOwner, applications.length]);

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const handleStatusChange = async (appId, status) => {
    try {
      await dispatch(updateApplicationStatus({ id: appId, status })).unwrap();
      showToast(`Status updated to "${status}"`, "success");
    } catch (err) {
      showToast(err || "Failed to update status", "error");
    }
  };

  const handleDownloadResume = async (appId, filename) => {
    try {
      const response = await api.get(`/applications/${appId}/resume`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || "resume.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("Resume downloaded", "success");
    } catch (err) {
      showToast("Failed to download resume", "error");
    }
  };

  // ------------------------------------------------------------
  // Access control
  // ------------------------------------------------------------
  if (job && user && authChecked && !isOwner) {
    return (
      <div className="empty-state">
        <div className="empty-emoji">🔒</div>
        <h3>Not authorized</h3>
        <p>Only the job poster can view applications.</p>
        <Link to={`/jobs/${jobId}`} className="btn-primary">
          Back to Job
        </Link>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className="page">
      <Link to={`/jobs/${jobId}`} className="back-link">
        ← Back to job
      </Link>

      <div className="page-header">
        <div>
          <h1>Applications</h1>
          {job && (
            <p className="page-subtitle">
              for <strong>{job.title}</strong> · {applications.length} applicant
              {applications.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {loading && <p className="status">Loading applications...</p>}

      {!loading && applications.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">📭</div>
          <h3>No applications yet</h3>
          <p>
            Share your job to attract applicants. Applications will appear here.
          </p>
        </div>
      )}

      <div className="applications-list">
        {applications.map((app) => {
          const applicant = app.applicant;
          const isExpanded = expanded === app._id;

          return (
            <div key={app._id} className="application-detail-card">
              {/* Header */}
              <div className="app-header">
                <div className="app-avatar">
                  {applicant?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="app-info">
                  <h3>{applicant?.name || "Unknown"}</h3>
                  <p className="app-email">{applicant?.email || "No email"}</p>
                </div>
                <span
                  className="application-status"
                  style={{
                    background: STATUS_COLORS[app.status] || "#888",
                  }}
                >
                  {app.status}
                </span>
              </div>

              {/* Meta grid */}
              <div className="app-meta-grid">
                <div className="app-meta-item">
                  <span className="meta-label">💰 Proposed Rate</span>
                  <span className="meta-value">
                    ${(app.proposedRate || 0).toLocaleString()}{" "}
                    <small>({app.proposedRateType || "fixed"})</small>
                  </span>
                </div>

                {app.estimatedDelivery && (
                  <div className="app-meta-item">
                    <span className="meta-label">⏱️ Delivery</span>
                    <span className="meta-value">{app.estimatedDelivery}</span>
                  </div>
                )}

                {applicant?.skills?.length > 0 && (
                  <div className="app-meta-item">
                    <span className="meta-label">🛠️ Skills</span>
                    <span className="meta-value">
                      {applicant.skills.slice(0, 5).join(", ")}
                    </span>
                  </div>
                )}

                {app.portfolioUrl && (
                  <div className="app-meta-item">
                    <span className="meta-label">🔗 Portfolio</span>
                    <a
                      href={app.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="meta-link"
                    >
                      {app.portfolioUrl.length > 40
                        ? app.portfolioUrl.slice(0, 40) + "..."
                        : app.portfolioUrl}
                    </a>
                  </div>
                )}
              </div>

              {/* Cover letter */}
              {app.coverLetter && (
                <div className="app-cover-letter">
                  <div className="cover-letter-header">
                    <strong>Cover Letter</strong>
                    <button
                      className="icon-btn-sm"
                      onClick={() => setExpanded(isExpanded ? null : app._id)}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                  <p className={`cover-text ${isExpanded ? "expanded" : ""}`}>
                    {app.coverLetter}
                  </p>
                </div>
              )}

              {/* Resume */}
              {app.resume?.filename && (
                <div className="app-resume">
                  <div className="resume-icon">📄</div>
                  <div className="resume-info">
                    <strong>{app.resume.originalName}</strong>
                    <span className="resume-size">
                      {app.resume.size
                        ? (app.resume.size / 1024).toFixed(1) + " KB"
                        : "Unknown size"}
                    </span>
                  </div>
                  <button
                    className="btn-ghost"
                    onClick={() =>
                      handleDownloadResume(app._id, app.resume.originalName)
                    }
                  >
                    ⬇️ Download
                  </button>
                </div>
              )}

              {/* Footer with status actions */}
              <div className="app-footer">
                <span className="app-date">
                  Applied {formatDate(app.createdAt)}
                </span>

                <div className="status-actions">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`status-btn ${
                        app.status === s ? "active" : ""
                      }`}
                      style={
                        app.status === s
                          ? {
                              background: STATUS_COLORS[s],
                              color: "#fff",
                            }
                          : {}
                      }
                      onClick={() => handleStatusChange(app._id, s)}
                      disabled={app.status === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobApplications;
