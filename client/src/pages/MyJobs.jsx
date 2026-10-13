/**
 * ============================================================
 * MY JOBS PAGE (Client) — Production Ready
 * ============================================================
 *
 * Manage posted jobs: view, close/reopen, delete.
 *
 * Features:
 * - Tabs (All / Open / Closed)
 * - Search
 * - Sort
 * - Stats bar
 * - Skeleton loading
 * ============================================================
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------
const TABS = [
  { key: "all", label: "All Jobs" },
  { key: "open", label: "🟢 Open" },
  { key: "closed", label: "🔴 Closed" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "applicants-high", label: "Most Applicants" },
  { value: "applicants-low", label: "Fewest Applicants" },
  { value: "title", label: "Title A → Z" },
];

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
const MyJobs = () => {
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [busyId, setBusyId] = useState(null);

  // ------------------------------------------------------------
  // Load jobs
  // ------------------------------------------------------------
  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/jobs/my-jobs");
      setJobs(data);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load jobs";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // ------------------------------------------------------------
  // Stats
  // ------------------------------------------------------------
  const stats = useMemo(() => {
    const openCount = jobs.filter((j) => j.status === "open").length;
    const closedCount = jobs.filter((j) => j.status === "closed").length;
    const totalApplicants = jobs.reduce(
      (sum, j) => sum + (j.applicantsCount || 0),
      0,
    );
    const totalPending = jobs.reduce(
      (sum, j) => sum + (j.pendingCount || 0),
      0,
    );
    return {
      total: jobs.length,
      open: openCount,
      closed: closedCount,
      totalApplicants,
      totalPending,
    };
  }, [jobs]);

  // ------------------------------------------------------------
  // Filtered + sorted
  // ------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...jobs];

    if (activeTab !== "all") {
      list = list.filter((j) => j.status === activeTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.company?.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "applicants-high":
          return (b.applicantsCount || 0) - (a.applicantsCount || 0);
        case "applicants-low":
          return (a.applicantsCount || 0) - (b.applicantsCount || 0);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "recent":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return list;
  }, [jobs, activeTab, search, sortBy]);

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const handleToggleStatus = async (job) => {
    const closing = job.status === "open";
    const newStatus = closing ? "closed" : "open";
    const verb = closing ? "close" : "reopen";

    if (!window.confirm(`Are you sure you want to ${verb} "${job.title}"?`)) {
      return;
    }

    setBusyId(job._id);
    try {
      await api.put(`/jobs/${job._id}`, { status: newStatus });
      showToast(
        closing ? "Job closed — freelancers can't apply" : "Job reopened",
        "success",
      );
      await loadJobs();
    } catch (err) {
      showToast(
        err.response?.data?.message || `Failed to ${verb} job`,
        "error",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (job) => {
    if (
      !window.confirm(
        `Delete "${job.title}"?\n\nThis will also remove all ${job.applicantsCount || 0} applications for it. This cannot be undone.`,
      )
    )
      return;

    setBusyId(job._id);
    try {
      await api.delete(`/jobs/${job._id}`);
      showToast("Job deleted permanently", "info");
      await loadJobs();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete job", "error");
    } finally {
      setBusyId(null);
    }
  };

  // ------------------------------------------------------------
  // Loading skeleton
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>📋 My Posted Jobs</h1>
        </div>
        <div className="my-jobs-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="my-job-card skeleton-job-card">
              <div
                className="skeleton-line shimmer"
                style={{ width: "40%", height: 18 }}
              />
              <div
                className="skeleton-line shimmer"
                style={{ width: "25%", height: 12, marginTop: 8 }}
              />
              <div
                className="skeleton-line shimmer"
                style={{ width: "70%", height: 12, marginTop: 16 }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Error
  // ------------------------------------------------------------
  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-emoji">😕</div>
        <h3>Couldn't load jobs</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={loadJobs}>
          Try Again
        </button>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className="page">
      {/* ============== HEADER ============== */}
      <div className="page-header">
        <div>
          <h1>📋 My Posted Jobs</h1>
          <p className="page-subtitle">
            {stats.total} job{stats.total !== 1 ? "s" : ""} posted ·{" "}
            {stats.totalApplicants} total applicant
            {stats.totalApplicants !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/post-job" className="btn-primary">
          + Post New Job
        </Link>
      </div>

      {/* ============== EMPTY STATE ============== */}
      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">📭</div>
          <h3>No jobs posted yet</h3>
          <p>Post your first job to start finding freelancers.</p>
          <Link to="/post-job" className="btn-primary">
            Post a Job
          </Link>
        </div>
      ) : (
        <>
          {/* ============== STATS ============== */}
          <div className="stats-bar">
            {TABS.map((t) => {
              const count =
                t.key === "all"
                  ? stats.total
                  : t.key === "open"
                    ? stats.open
                    : stats.closed;
              return (
                <button
                  key={t.key}
                  className={`stat-chip ${activeTab === t.key ? "active" : ""}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                  <span className="stat-count">{count}</span>
                </button>
              );
            })}
            {stats.totalPending > 0 && (
              <span className="stat-pending">
                🆕 {stats.totalPending} pending application
                {stats.totalPending !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* ============== TOOLBAR ============== */}
          <div className="applications-toolbar">
            <input
              type="text"
              placeholder="🔍 Search by title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="apps-search"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="apps-sort"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* ============== FILTERED EMPTY ============== */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🔍</div>
              <h3>No matching jobs</h3>
              <p>Try adjusting your filters or search.</p>
              <button
                className="btn-ghost"
                onClick={() => {
                  setActiveTab("all");
                  setSearch("");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* ============== JOB LIST ============== */
            <div className="my-jobs-list">
              {filtered.map((job) => {
                const isBusy = busyId === job._id;
                return (
                  <div
                    key={job._id}
                    className={`my-job-card ${isBusy ? "busy" : ""}`}
                  >
                    {/* Header */}
                    <div className="my-job-header">
                      <div>
                        <h3>{job.title}</h3>
                        <p className="my-job-company">{job.company}</p>
                      </div>
                      <span
                        className={`job-status-badge ${
                          job.status === "open"
                            ? "status-open"
                            : "status-closed"
                        }`}
                      >
                        {job.status === "open" ? "🟢 Open" : "🔴 Closed"}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="my-job-meta">
                      <span>
                        💰 ${job.budgetMin?.toLocaleString() || 0}-
                        {job.budgetMax?.toLocaleString() || 0}{" "}
                        <small>{job.budgetType}</small>
                      </span>
                      <span>
                        👥 {job.applicantsCount || 0} applicant
                        {job.applicantsCount !== 1 ? "s" : ""}
                      </span>
                      {job.pendingCount > 0 && (
                        <span className="pending-highlight">
                          🆕 {job.pendingCount} pending
                        </span>
                      )}
                      <span>
                        📅 Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="my-job-actions">
                      <Link
                        to={`/jobs/${job._id}/applications`}
                        className="btn-primary"
                      >
                        📥 View Applications ({job.applicantsCount || 0})
                      </Link>
                      <Link to={`/jobs/${job._id}`} className="btn-ghost">
                        👁 View
                      </Link>
                      <button
                        className="btn-ghost"
                        onClick={() => handleToggleStatus(job)}
                        disabled={isBusy}
                      >
                        {job.status === "open" ? "🔒 Close" : "🔓 Reopen"}
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(job)}
                        disabled={isBusy}
                      >
                        {isBusy ? "..." : "🗑 Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyJobs;
