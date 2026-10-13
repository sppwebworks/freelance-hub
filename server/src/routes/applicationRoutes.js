import express from "express";
import {
  applyToJob,
  getMyApplications,
  getReceivedApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
  downloadResume,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadResume } from "../middleware/upload.js";

const router = express.Router();
router.use(protect);

// Apply with file upload
router.post("/", uploadResume, applyToJob);

// Freelancer's sent applications
router.get("/me", getMyApplications);

// Client's received applications (across all their jobs)
router.get("/received", getReceivedApplications);

// Applications for a specific job (owner only)
router.get("/job/:jobId", getJobApplications);

// Download resume
router.get("/:id/resume", downloadResume);

// Update status
router.put("/:id/status", updateApplicationStatus);

// Withdraw application
router.delete("/:id", withdrawApplication);

export default router;
