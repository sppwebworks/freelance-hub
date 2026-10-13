import express from "express";
import jwt from "jsonwebtoken";
import {
  getJobs,
  getFilterCounts,
  getJobById,
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
  importFromRemoteOK,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

// Optional auth — attaches user if token is present, but doesn't fail
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return next();
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    req.user = { _id: decoded.id };
  } catch {}
  next();
};

const router = express.Router();

// ============ PUBLIC / OPTIONAL AUTH ============
router.get("/", optionalAuth, getJobs);
router.get("/filters", getFilterCounts);

// ============ PROTECTED (must come BEFORE /:id) ============
router.get("/my-jobs", protect, getMyJobs);
router.post("/", protect, createJob);
router.post("/import-remoteok", protect, importFromRemoteOK);

// ============ DYNAMIC ROUTES (LAST) ============
router.get("/:id", optionalAuth, getJobById);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);

export default router;
