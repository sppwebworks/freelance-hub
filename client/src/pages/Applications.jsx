/**
 * ============================================================
 * APPLICATIONS PAGE — ROLE-AWARE (Production)
 * ============================================================
 *
 * Freelancer → sees applications they SENT
 * Client     → sees applications they RECEIVED for their jobs
 *
 * Features:
 * - Stats bar (counts per status)
 * - Filter by status
 * - Sort by date / rate / name
 * - Search by applicant name (client) / job title (freelancer)
 * - Withdraw application (freelancer)
 * - Review link → per-job page (client)
 * ============================================================
 */

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchMyApplications,
  fetchReceivedApplications,
} from "../features/applications/applicationsSlice";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

// ------------------------------------------------------------
// CONSTANTS
// ------------------------------------------------------------
const STATUSES = [
  "all",
  "pending",
  "reviewed",
  "shortlisted",
  "rejected",
  "hired",
];

const STATUS_COLORS = {
  pending: "#f2d600",
  reviewed: "#0079bf",
  shortlisted: "#61bd4f",
  rejected: "#eb5a46",
  hired: "#9c27b0",
};

const STATUS_LABELS = {
  all: "All",
  pending: "⏳ Pending",
  reviewed: "👀 Reviewed",
  shortlisted: "⭐ Shortlisted",
  rejected: "❌ Rejected",
  hired: "🎉 Hired",
};

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "rate-high", label: "Rate: High → Low" },
  { value: "rate-low", label: "Rate: Low → High" },
  { value: "name", label: "Name A → Z" },
];

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------
const Applications = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { user } = useSelector((s) => s.auth);
  const { mine, received, loading, error } = useSelector((s) => s.applications);

  const isClient = user?.role === "client";
  const sourceList = isClient ? received : mine;

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [search, setSearch] = useState("");
  const [withdrawing, setWithdrawing] = useState(null);

  // ------------------------------------------------------------
  // Fetch on mount
  // ------------------------------------------------------------
  useEffect(() => {
    if (isClient) {
      dispatch(fetchReceivedApplications());
    } else {
      dispatch(fetchMyApplications());
    }
  }, [dispatch, isClient]);

  // ------------------------------------------------------------
  // Derived: stats
  // ------------------------------------------------------------
  const stats = useMemo(() => {
    const counts = { all: sourceList.length };
    STATUSES.slice(1).forEach((s) => {
      counts[s] = sourceList.filter((a) => a.status === s).length;
    });
    return counts;
  }, [sourceList]);

  // ------------------------------------------------------------
  // Derived: filtered + sorted
  // ------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...sourceList];

    // Filter by status
    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => {
        const applicantName = a.applicant?.name?.toLowerCase() || "";
        const jobTitle = a.job?.title?.toLowerCase() || "";
        const company = a.job?.company?.toLowerCase() || "";
        return (
          applicantName.includes(q) ||
          jobTitle.includes(q) ||
          company.includes(q)
        );
      });
    }

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "rate-high":
          return (b.proposedRate || 0) - (a.proposedRate || 0);
        case "rate-low":
          return (a.proposedRate || 0) - (b.proposedRate || 0);
        case "name":
          return (a.applicant?.name || "").localeCompare(
            b.applicant?.name || "",
          );
        case "recent":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return list;
  }, [sourceList, statusFilter, search, sortBy]);

  // ------------------------------------------------------------
  // Withdraw handler (freelancer only)
  // ------------------------------------------------------------
  const handleWithdraw = async (appId) => {
    if (!window.confirm("Withdraw this application? This cannot be undone."))
      return;

    setWithdrawing(appId);
    try {
      await api.delete(`/applications/${appId}`);
      showToast("Application withdrawn", "info");
      dispatch(fetchMyApplications());
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to withdraw", "error");
    } finally {
      setWithdrawing(null);
    }
  };

  // ------------------------------------------------------------
  // Loading
  // ------------------------------------------------------------
  if (loading && sourceList.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>
            {isClient ? "📥 Received Applications" : "📤 My Applications"}
          </h1>
        </div>
        <div className="applications-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="application-card skeleton-application">
              <div
                className="skeleton-line shimmer"
                style={{ width: "40%", height: 16 }}
              />
              <div
                className="skeleton-line shimmer"
                style={{ width: "60%", height: 12, marginTop: 8 }}
              />
              <div
                className="skeleton-line shimmer"
                style={{ width: "30%", height: 12, marginTop: 8 }}
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
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button
          className="btn-primary"
          onClick={() =>
            isClient
              ? dispatch(fetchReceivedApplications())
              : dispatch(fetchMyApplications())
          }
        >
          Try Again
        </button>
      </div>
    );
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <div className="page">
      {/* ============== HEADER ============== */}
      <div className="page-header">
        <div>
          <h1>
            {isClient ? "📥 Received Applications" : "📤 My Applications"}
          </h1>
          <p className="page-subtitle">
            {isClient
              ? "Applications sent to your job postings"
              : "Applications you sent to jobs"}
          </p>
        </div>
      </div>

      {/* ============== STATS BAR ============== */}
      {sourceList.length > 0 && (
        <div className="stats-bar">
          {STATUSES.map((s) => {
            const count = stats[s] || 0;
            if (s !== "all" && count === 0 && statusFilter !== s) return null;
            return (
              <button
                key={s}
                className={`stat-chip ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
                style={
                  statusFilter === s && s !== "all"
                    ? { background: STATUS_COLORS[s], color: "#fff" }
                    : {}
                }
              >
                {STATUS_LABELS[s]}
                <span className="stat-count">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ============== TOOLBAR ============== */}
      {sourceList.length > 0 && (
        <div className="applications-toolbar">
          <input
            type="text"
            placeholder={
              isClient
                ? "🔍 Search by applicant or job..."
                : "🔍 Search by job title or company..."
            }
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
      )}

      {/* ============== EMPTY STATE ============== */}
      {sourceList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">{isClient ? "📭" : "📨"}</div>
          <h3>
            {isClient
              ? "No applications received yet"
              : "No applications sent yet"}
          </h3>
          <p>
            {isClient
              ? "When freelancers apply to your jobs, their applications will appear here."
              : "Browse jobs and apply to get started."}
          </p>
          <Link to={isClient ? "/post-job" : "/"} className="btn-primary">
            {isClient ? "Post a Job" : "Browse Jobs"}
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🔍</div>
          <h3>No matching applications</h3>
          <p>Try adjusting your filters or search.</p>
          <button
            className="btn-ghost"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* ============== APPLICATIONS LIST ============== */
        <div className="applications-list">
          {filtered.map((app) => (
            <div key={app._id} className="application-card">
              {/* === MAIN === */}
              <div className="application-main">
                {/* Applicant header (client view) */}
                {isClient && (
                  <div className="applicant-header">
                    <div className="user-avatar">
                      {app.applicant?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <strong>{app.applicant?.name || "Unknown"}</strong>
                      <p className="applicant-email">
                        {app.applicant?.email || "No email"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Job title */}
                <Link
                  to={`/jobs/${app.job?._id}${isClient ? "/applications" : ""}`}
                  className="application-title"
                >
                  {isClient ? "Applied to: " : ""}
                  {app.job?.title || "Job removed"}
                </Link>

                <p className="application-company">{app.job?.company || ""}</p>

                {/* Skills preview (client) */}
                {isClient && app.applicant?.skills?.length > 0 && (
                  <div className="applicant-skills">
                    {app.applicant.skills.slice(0, 4).map((s, i) => (
                      <span key={i} className="skill-tag">
                        {s}
                      </span>
                    ))}
                    {app.applicant.skills.length > 4 && (
                      <span className="skill-tag">
                        +{app.applicant.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Meta row */}
                <div className="application-meta">
                  {app.proposedRate > 0 && (
                    <span>
                      💰 ${app.proposedRate.toLocaleString()}{" "}
                      <small>({app.proposedRateType || "fixed"})</small>
                    </span>
                  )}
                  {app.estimatedDelivery && (
                    <span>⏱️ {app.estimatedDelivery}</span>
                  )}
                  <span>
                    📅 Applied {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* === RIGHT SIDE === */}
              <div className="application-side">
                <span
                  className="application-status"
                  style={{ background: STATUS_COLORS[app.status] }}
                >
                  {app.status}
                </span>

                {isClient ? (
                  <Link
                    to={`/jobs/${app.job?._id}/applications`}
                    className="btn-primary btn-sm"
                  >
                    Review →
                  </Link>
                ) : (
                  <>
                    {app.status === "pending" && (
                      <button
                        className="btn-danger btn-sm"
                        onClick={() => handleWithdraw(app._id)}
                        disabled={withdrawing === app._id}
                      >
                        {withdrawing === app._id ? "..." : "Withdraw"}
                      </button>
                    )}
                    <Link
                      to={`/jobs/${app.job?._id}`}
                      className="btn-ghost btn-sm"
                    >
                      View Job
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
