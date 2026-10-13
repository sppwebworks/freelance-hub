/**
 * ============================================================
 * PROFILE PAGE — Production Ready
 * ============================================================
 *
 * Edit name, bio, skills, hourly rate, location.
 * Includes: reset, unsaved warning, account info.
 * ============================================================
 */

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { loadUser } from "../features/auth/authSlice";

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const serializeForm = (form) => ({
  name: form.name.trim(),
  bio: form.bio.trim(),
  skills: form.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  hourlyRate: Number(form.hourlyRate) || 0,
  location: form.location.trim(),
});

const userToForm = (user) => ({
  name: user?.name || "",
  bio: user?.bio || "",
  skills: (user?.skills || []).join(", "),
  hourlyRate: user?.hourlyRate || "",
  location: user?.location || "",
});

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
const Profile = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user } = useSelector((s) => s.auth);

  const [form, setForm] = useState(() => userToForm(user));
  const [saving, setSaving] = useState(false);
  const [initialForm, setInitialForm] = useState(() => userToForm(user));

  // ------------------------------------------------------------
  // Sync when user changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (user) {
      const next = userToForm(user);
      setForm(next);
      setInitialForm(next);
    }
  }, [user]);

  // ------------------------------------------------------------
  // Dirty detection
  // ------------------------------------------------------------
  const isDirty = useMemo(() => {
    return (
      JSON.stringify(serializeForm(form)) !==
      JSON.stringify(serializeForm(initialForm))
    );
  }, [form, initialForm]);

  // Warn before leaving if unsaved
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    setSaving(true);
    try {
      await api.put("/auth/me", serializeForm(form));
      await dispatch(loadUser());
      setInitialForm(form);
      showToast("Profile updated successfully", "success");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update profile",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    showToast("Changes discarded", "info");
  };

  const skillsPreview = useMemo(
    () =>
      form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [form.skills],
  );

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  if (!user) {
    return (
      <div className="status">
        <div className="spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* ============== HEADER ============== */}
      <div className="page-header">
        <div>
          <h1>👤 My Profile</h1>
          <p className="page-subtitle">Manage your account details</p>
        </div>
        <Link to="/" className="btn-ghost">
          ← Back
        </Link>
      </div>

      {/* ============== PROFILE CARD ============== */}
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {user.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="profile-header-info">
          <h2>{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <div className="profile-badges">
            <span className={`role-badge role-${user.role}`}>
              {user.role === "client" ? "🏢 Client" : "🧑‍💻 Freelancer"}
            </span>
            {user.role === "freelancer" && user.hourlyRate > 0 && (
              <span className="role-badge">💰 ${user.hourlyRate}/hr</span>
            )}
            {user.location && (
              <span className="role-badge">📍 {user.location}</span>
            )}
          </div>
        </div>
      </div>

      {/* ============== EDIT FORM ============== */}
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-form-header">
          <h3>Edit Information</h3>
          {isDirty && <span className="unsaved-badge">● Unsaved changes</span>}
        </div>

        {/* Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Full Name <span className="required">*</span>
          </label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
            maxLength={60}
            autoComplete="name"
          />
          <span className="form-hint">{form.name.length}/60</span>
        </div>

        {/* Location */}
        <div className="form-group">
          <label className="form-label" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g. Bangalore, India"
            maxLength={100}
            autoComplete="address-level2"
          />
        </div>

        {/* Freelancer-only fields */}
        {user.role === "freelancer" && (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="hourlyRate">
                Hourly Rate (USD)
              </label>
              <input
                id="hourlyRate"
                type="number"
                min="0"
                max="1000"
                step="1"
                value={form.hourlyRate}
                onChange={(e) => update("hourlyRate", e.target.value)}
                placeholder="75"
              />
              <span className="form-hint">
                This shows on your applications to clients.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="skills">
                Skills
              </label>
              <input
                id="skills"
                value={form.skills}
                onChange={(e) => update("skills", e.target.value)}
                placeholder="React, Node.js, MongoDB (comma-separated)"
              />
              <span className="form-hint">
                {skillsPreview.length} skill
                {skillsPreview.length !== 1 ? "s" : ""} — clients can search by
                these.
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
          </>
        )}

        {/* Bio */}
        <div className="form-group">
          <label className="form-label" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            rows={5}
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Tell clients/freelancers about yourself..."
            maxLength={500}
          />
          <span className="form-hint">{form.bio.length}/500</span>
        </div>

        {/* Actions */}
        <div className="form-actions">
          {isDirty && (
            <button
              type="button"
              className="btn-ghost"
              onClick={handleReset}
              disabled={saving}
            >
              Reset
            </button>
          )}
          <button
            type="submit"
            className="btn-primary btn-large"
            disabled={saving || !isDirty}
          >
            {saving ? "⏳ Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </form>

      {/* ============== ACCOUNT INFO ============== */}
      <div className="account-info-card">
        <h3>Account Information</h3>
        <div className="info-grid">
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Role</span>
            <span className="info-value">
              {user.role === "client" ? "Client" : "Freelancer"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Member since</span>
            <span className="info-value">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">User ID</span>
            <span className="info-value info-mono">
              {user._id?.slice(-8) || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
