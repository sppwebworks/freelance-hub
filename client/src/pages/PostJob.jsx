/**
 * ============================================================
 * POST JOB PAGE
 * ============================================================
 *
 * Allows CLIENT users to create a new job posting.
 *
 * Features:
 * - Role gate (only clients can access)
 * - Client-side validation
 * - Live preview of budget format
 * - Skills chips parsed from comma string
 * - Real-time socket broadcast on success
 *
 * FIXES APPLIED:
 * - Safe parse of skills (handles undefined)
 * - Type coercion for budget numbers
 * - Required field validation before submit
 * - Backend error messages displayed clearly
 * - Success toast + navigate to job detail
 * ============================================================
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

const CATEGORIES = [
  { value: "development", label: "💻 Development" },
  { value: "design", label: "🎨 Design" },
  { value: "marketing", label: "📣 Marketing" },
  { value: "writing", label: "✍️ Writing" },
  { value: "other", label: "📦 Other" },
];

const EXPERIENCE = [
  { value: "entry", label: "Entry Level" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
];

const BUDGET_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Hourly Rate" },
];

const PostJob = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useSelector((s) => s.auth);

  // ------------------------------------------------------------
  // Form state
  // ------------------------------------------------------------
  const [form, setForm] = useState({
    title: "",
    company: user?.name || "",
    description: "",
    category: "development",
    skills: "",
    experienceLevel: "intermediate",
    budgetType: "fixed",
    budgetMin: "",
    budgetMax: "",
    location: "Remote",
    isRemote: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Sync company name when user loads (after refresh)
  useEffect(() => {
    if (user?.name && !form.company) {
      setForm((f) => ({ ...f, company: user.name }));
    }
  }, [user]); // eslint-disable-line

  // ------------------------------------------------------------
  // Field update helper
  // ------------------------------------------------------------
  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear error for this field on change
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  };

  // ------------------------------------------------------------
  // Validation
  // ------------------------------------------------------------
  const validate = () => {
    const errs = {};

    if (!form.title.trim()) {
      errs.title = "Job title is required";
    } else if (form.title.trim().length < 5) {
      errs.title = "Title must be at least 5 characters";
    }

    if (!form.company.trim()) {
      errs.company = "Company name is required";
    }

    if (!form.description.trim()) {
      errs.description = "Description is required";
    } else if (form.description.trim().length < 30) {
      errs.description = "Description must be at least 30 characters";
    }

    const min = Number(form.budgetMin);
    const max = Number(form.budgetMax);

    if (form.budgetMin && isNaN(min)) {
      errs.budgetMin = "Budget must be a number";
    }
    if (form.budgetMax && isNaN(max)) {
      errs.budgetMax = "Budget must be a number";
    }
    if (min && max && min > max) {
      errs.budgetMax = "Max must be greater than min";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showToast("Please fix the errors below", "error");
      return;
    }

    setSubmitting(true);

    try {
      // Build payload — safely parse everything
      const payload = {
        title: form.title.trim(),
        company: form.company.trim(),
        description: form.description.trim(),
        category: form.category || "development",
        skills:
          typeof form.skills === "string"
            ? form.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        experienceLevel: form.experienceLevel || "intermediate",
        budgetType: form.budgetType || "fixed",
        budgetMin: Number(form.budgetMin) || 0,
        budgetMax: Number(form.budgetMax) || 0,
        location: form.location || "Remote",
        isRemote: form.isRemote !== false,
      };

      console.log("📤 Posting job:", payload);

      const { data } = await api.post("/jobs", payload);

      console.log("✅ Job created:", data._id);

      showToast("Job posted successfully", "success");
      navigate(`/jobs/${data._id}`);
    } catch (err) {
      console.error("❌ Post failed:", err.response?.data);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to post job. Please try again.";

      showToast(message, "error");

      // If backend specified field errors, show them
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // Role gate
  // ------------------------------------------------------------
  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-emoji">🔒</div>
        <h3>Please log in</h3>
        <Link to="/login" className="btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  if (user.role !== "client") {
    return (
      <div className="empty-state">
        <div className="empty-emoji">🔒</div>
        <h3>Only clients can post jobs</h3>
        <p>
          You're currently signed in as a <strong>freelancer</strong>.
        </p>
        <p style={{ fontSize: "0.9rem", color: "var(--text-3)" }}>
          Register a new account with the "Client" role to post jobs.
        </p>
        <Link to="/" className="btn-primary">
          Browse Jobs
        </Link>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Preview helpers
  // ------------------------------------------------------------
  const skillsPreview =
    typeof form.skills === "string"
      ? form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const budgetPreview = () => {
    const min = Number(form.budgetMin) || 0;
    const max = Number(form.budgetMax) || 0;
    if (!min && !max) return "Not specified";
    if (form.budgetType === "hourly") {
      return `$${min}-${max}/hr`;
    }
    return `$${min.toLocaleString()}-${max.toLocaleString()}`;
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className="post-job-page">
      <div className="post-job-header">
        <Link to="/" className="back-link">
          ← Back to jobs
        </Link>
        <h1>Post a New Job</h1>
        <p className="post-job-subtitle">
          Fill in the details below. You can edit or close the job anytime.
        </p>
      </div>

      <form className="post-job-form" onSubmit={handleSubmit}>
        {/* ===================== TITLE ===================== */}
        <div className="form-group">
          <label className="form-label">
            Job Title <span className="required">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Senior React Developer"
            maxLength={150}
            className={errors.title ? "input-error" : ""}
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
          <span className="form-hint">{form.title.length}/150</span>
        </div>

        {/* ===================== COMPANY ===================== */}
        <div className="form-group">
          <label className="form-label">
            Company <span className="required">*</span>
          </label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder="e.g. TechFlow Inc"
            maxLength={100}
            className={errors.company ? "input-error" : ""}
          />
          {errors.company && (
            <span className="form-error">{errors.company}</span>
          )}
        </div>

        {/* ===================== DESCRIPTION ===================== */}
        <div className="form-group">
          <label className="form-label">
            Job Description <span className="required">*</span>
          </label>
          <textarea
            rows={6}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the role, responsibilities, requirements, and any perks..."
            maxLength={5000}
            className={errors.description ? "input-error" : ""}
          />
          {errors.description && (
            <span className="form-error">{errors.description}</span>
          )}
          <span className="form-hint">{form.description.length}/5000</span>
        </div>

        {/* ===================== CATEGORY + EXPERIENCE ===================== */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Experience Level</label>
            <select
              value={form.experienceLevel}
              onChange={(e) => update("experienceLevel", e.target.value)}
            >
              {EXPERIENCE.map((exp) => (
                <option key={exp.value} value={exp.value}>
                  {exp.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===================== SKILLS ===================== */}
        <div className="form-group">
          <label className="form-label">Required Skills</label>
          <input
            type="text"
            value={form.skills}
            onChange={(e) => update("skills", e.target.value)}
            placeholder="React, Node.js, MongoDB, TypeScript (comma-separated)"
          />
          <span className="form-hint">
            Separate skills with commas. {skillsPreview.length} skill
            {skillsPreview.length !== 1 ? "s" : ""} detected.
          </span>

          {skillsPreview.length > 0 && (
            <div className="skills-preview">
              {skillsPreview.map((s, i) => (
                <span key={i} className="skill-tag">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ===================== BUDGET ===================== */}
        <div className="form-group">
          <label className="form-label">Budget</label>
          <div className="budget-grid">
            <div>
              <label className="mini-label">Min (USD)</label>
              <input
                type="number"
                min="0"
                value={form.budgetMin}
                onChange={(e) => update("budgetMin", e.target.value)}
                placeholder="1000"
                className={errors.budgetMin ? "input-error" : ""}
              />
              {errors.budgetMin && (
                <span className="form-error">{errors.budgetMin}</span>
              )}
            </div>

            <div>
              <label className="mini-label">Max (USD)</label>
              <input
                type="number"
                min="0"
                value={form.budgetMax}
                onChange={(e) => update("budgetMax", e.target.value)}
                placeholder="5000"
                className={errors.budgetMax ? "input-error" : ""}
              />
              {errors.budgetMax && (
                <span className="form-error">{errors.budgetMax}</span>
              )}
            </div>

            <div>
              <label className="mini-label">Type</label>
              <select
                value={form.budgetType}
                onChange={(e) => update("budgetType", e.target.value)}
              >
                {BUDGET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <span className="form-hint">
            Preview: <strong>{budgetPreview()}</strong>
          </span>
        </div>

        {/* ===================== LOCATION ===================== */}
        <div className="form-group">
          <label className="form-label">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Remote, New York, London..."
            disabled={form.isRemote}
          />
          <label className="filter-checkbox" style={{ marginTop: "0.5rem" }}>
            <input
              type="checkbox"
              checked={form.isRemote}
              onChange={(e) => {
                update("isRemote", e.target.checked);
                if (e.target.checked) update("location", "Remote");
              }}
            />
            🌍 This is a fully remote position
          </label>
        </div>

        {/* ===================== LIVE PREVIEW ===================== */}
        <div className="live-preview">
          <h3 className="preview-title">📄 Preview</h3>
          <div className="preview-card">
            <div className="preview-header">
              <div className="job-company-logo">
                <span>{form.company?.[0]?.toUpperCase() || "?"}</span>
              </div>
              <div>
                <h4>{form.title || "Job Title"}</h4>
                <p>{form.company || "Company"}</p>
              </div>
            </div>
            {skillsPreview.length > 0 && (
              <div className="job-card-skills" style={{ marginTop: "0.75rem" }}>
                {skillsPreview.slice(0, 5).map((s, i) => (
                  <span key={i} className="skill-tag">
                    {s}
                  </span>
                ))}
              </div>
            )}
            <div className="preview-footer">
              <span className="job-budget">{budgetPreview()}</span>
              <span className="job-meta">
                {form.isRemote && "🌍 Remote"} · {form.experienceLevel}
              </span>
            </div>
          </div>
        </div>

        {/* ===================== ACTIONS ===================== */}
        <div className="form-actions">
          <Link to="/" className="btn-ghost">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary btn-large"
            disabled={submitting}
          >
            {submitting ? "⏳ Posting..." : "🚀 Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
