/**
 * ============================================================
 * APPLY MODAL — Enhanced Application Form
 * ============================================================
 *
 * Features:
 * - Cover letter (with character counter)
 * - Proposed rate + type (fixed/hourly)
 * - Estimated delivery
 * - Portfolio / LinkedIn URL
 * - Resume upload (drag-drop + click)
 * - File validation (type + size)
 * - Preview of attached file
 * ============================================================
 */

import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../common/Modal";
import { applyToJob } from "../../features/applications/applicationsSlice";
import { useToast } from "../../context/ToastContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const ApplyModal = ({ isOpen, onClose, job }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user } = useSelector((s) => s.auth);

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    coverLetter: "",
    proposedRate: "",
    proposedRateType: "fixed",
    estimatedDelivery: "",
    portfolioUrl: user?.portfolioUrl || "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ------------------------------------------------------------
  // Update field
  // ------------------------------------------------------------
  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  };

  // ------------------------------------------------------------
  // File handling
  // ------------------------------------------------------------
  const validateFile = (file) => {
    if (!file) return "Please select a file";
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only PDF, DOC, DOCX, JPG, PNG allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Max ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    return null;
  };

  const handleFileSelect = (file) => {
    const error = validateFile(file);
    if (error) {
      showToast(error, "error");
      return;
    }
    setResumeFile(file);
    if (errors.resume) {
      setErrors((e) => {
        const next = { ...e };
        delete next.resume;
        return next;
      });
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const removeFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ------------------------------------------------------------
  // Validation
  // ------------------------------------------------------------
  const validate = () => {
    const errs = {};

    if (!form.coverLetter.trim()) {
      errs.coverLetter = "Cover letter is required";
    } else if (form.coverLetter.trim().length < 50) {
      errs.coverLetter = "Must be at least 50 characters";
    } else if (form.coverLetter.length > 2000) {
      errs.coverLetter = "Max 2000 characters";
    }

    const rate = Number(form.proposedRate);
    if (!form.proposedRate) {
      errs.proposedRate = "Proposed rate is required";
    } else if (isNaN(rate) || rate <= 0) {
      errs.proposedRate = "Must be a positive number";
    }

    if (!resumeFile) {
      errs.resume = "Resume is required";
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
      // Build FormData for file upload
      const data = new FormData();
      data.append("jobId", job._id);
      data.append("coverLetter", form.coverLetter.trim());
      data.append("proposedRate", Number(form.proposedRate));
      data.append("proposedRateType", form.proposedRateType);
      data.append("estimatedDelivery", form.estimatedDelivery.trim());
      data.append("portfolioUrl", form.portfolioUrl.trim());
      data.append("resume", resumeFile);

      await dispatch(applyToJob(data)).unwrap();

      showToast("Application submitted successfully", "success");
      onClose();
      resetForm();
    } catch (err) {
      console.error("❌ Apply failed:", err);
      showToast(err || "Failed to submit application", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      coverLetter: "",
      proposedRate: "",
      proposedRateType: "fixed",
      estimatedDelivery: "",
      portfolioUrl: "",
    });
    setResumeFile(null);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!job) return null;

  const budgetHint = job.budgetType === "hourly" ? "per hour" : "total";

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} className="modal-lg">
      <form onSubmit={handleSubmit} className="apply-form-enhanced">
        {/* ============== HEADER ============== */}
        <div className="apply-header">
          <div>
            <h2>Apply for "{job.title}"</h2>
            <p className="apply-company">
              at {job.company} · Budget: ${job.budgetMin?.toLocaleString()}-
              {job.budgetMax?.toLocaleString()} {job.budgetType}
            </p>
          </div>
        </div>

        {/* ============== COVER LETTER ============== */}
        <div className="form-group">
          <label className="form-label">
            Cover Letter <span className="required">*</span>
          </label>
          <textarea
            rows={6}
            value={form.coverLetter}
            onChange={(e) => update("coverLetter", e.target.value)}
            placeholder="Why are you a great fit for this role? Mention relevant experience, past projects, and why you're excited about this job..."
            maxLength={2000}
            className={errors.coverLetter ? "input-error" : ""}
          />
          {errors.coverLetter && (
            <span className="form-error">{errors.coverLetter}</span>
          )}
          <span className="form-hint">
            {form.coverLetter.length}/2000 characters (min 50)
          </span>
        </div>

        {/* ============== RATE + TYPE ============== */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Proposed Rate (USD) <span className="required">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={form.proposedRate}
              onChange={(e) => update("proposedRate", e.target.value)}
              placeholder={job.budgetMax || 5000}
              className={errors.proposedRate ? "input-error" : ""}
            />
            {errors.proposedRate && (
              <span className="form-error">{errors.proposedRate}</span>
            )}
            <span className="form-hint">{budgetHint}</span>
          </div>

          <div className="form-group">
            <label className="form-label">Rate Type</label>
            <select
              value={form.proposedRateType}
              onChange={(e) => update("proposedRateType", e.target.value)}
            >
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>
        </div>

        {/* ============== DELIVERY ============== */}
        <div className="form-group">
          <label className="form-label">Estimated Delivery</label>
          <input
            type="text"
            value={form.estimatedDelivery}
            onChange={(e) => update("estimatedDelivery", e.target.value)}
            placeholder="e.g. 2 weeks, 10 days, 1 month"
            maxLength={100}
          />
          <span className="form-hint">
            When can you deliver the finished work?
          </span>
        </div>

        {/* ============== PORTFOLIO ============== */}
        <div className="form-group">
          <label className="form-label">Portfolio / LinkedIn / GitHub</label>
          <input
            type="url"
            value={form.portfolioUrl}
            onChange={(e) => update("portfolioUrl", e.target.value)}
            placeholder="https://yourportfolio.com or https://github.com/yourname"
            maxLength={500}
          />
          <span className="form-hint">
            Optional but strongly recommended. Employers love proof of work.
          </span>
        </div>

        {/* ============== RESUME UPLOAD ============== */}
        <div className="form-group">
          <label className="form-label">
            Resume / CV <span className="required">*</span>
          </label>

          {!resumeFile ? (
            <div
              className={`file-drop-zone ${dragging ? "dragging" : ""} ${
                errors.resume ? "input-error" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="file-drop-icon">📎</div>
              <p className="file-drop-text">
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p className="file-drop-hint">
                PDF, DOC, DOCX, JPG, PNG · Max 5MB
              </p>
            </div>
          ) : (
            <div className="file-preview">
              <div className="file-preview-icon">
                {resumeFile.type.includes("pdf") ? "📄" : "📎"}
              </div>
              <div className="file-preview-info">
                <p className="file-name">{resumeFile.name}</p>
                <p className="file-size">{formatFileSize(resumeFile.size)}</p>
              </div>
              <button
                type="button"
                className="icon-btn-sm"
                onClick={removeFile}
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileInput}
            style={{ display: "none" }}
          />

          {errors.resume && <span className="form-error">{errors.resume}</span>}
        </div>

        {/* ============== ACTIONS ============== */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary btn-large"
            disabled={submitting}
          >
            {submitting ? "⏳ Submitting..." : "📤 Submit Application"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyModal;
