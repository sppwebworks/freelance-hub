import asyncHandler from "express-async-handler";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { getIO } from "../config/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ APPLY TO JOB ============
export const applyToJob = asyncHandler(async (req, res) => {
  const {
    jobId,
    coverLetter,
    proposedRate,
    proposedRateType,
    estimatedDelivery,
    portfolioUrl,
  } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  if (job.status === "closed") {
    res.status(400);
    throw new Error("This job is closed");
  }

  const existing = await Application.findOne({
    job: jobId,
    applicant: req.user._id,
  });
  if (existing) {
    res.status(400);
    throw new Error("You already applied to this job");
  }

  if (!coverLetter?.trim()) {
    res.status(400);
    throw new Error("Cover letter is required");
  }
  if (coverLetter.trim().length < 50) {
    res.status(400);
    throw new Error("Cover letter must be at least 50 characters");
  }
  if (!proposedRate || Number(proposedRate) <= 0) {
    res.status(400);
    throw new Error("Proposed rate must be greater than 0");
  }
  if (!req.file) {
    res.status(400);
    throw new Error("Resume is required");
  }

  const app = await Application.create({
    job: jobId,
    applicant: req.user._id,
    coverLetter: coverLetter.trim(),
    proposedRate: Number(proposedRate),
    proposedRateType: proposedRateType || "fixed",
    estimatedDelivery: estimatedDelivery?.trim() || "",
    portfolioUrl: portfolioUrl?.trim() || "",
    resume: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
    },
  });

  await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

  await app.populate("applicant", "name email skills");
  await app.populate("job", "title company");

  getIO().to(`job:${jobId}`).emit("application:new", {
    application: app,
  });

  res.status(201).json(app);
});

// ============ GET MY APPLICATIONS (Freelancer) ============
export const getMyApplications = asyncHandler(async (req, res) => {
  const apps = await Application.find({ applicant: req.user._id })
    .populate("job", "title company budgetMin budgetMax status")
    .sort("-createdAt");
  res.json(apps);
});

// ============ GET RECEIVED APPLICATIONS (Client) ============
export const getReceivedApplications = asyncHandler(async (req, res) => {
  if (req.user.role !== "client") {
    res.status(403);
    throw new Error("Only clients can view received applications");
  }

  const jobs = await Job.find({ postedBy: req.user._id }).select("_id title");

  if (jobs.length === 0) {
    return res.json({ applications: [], totalJobs: 0, jobs: [] });
  }

  const jobIds = jobs.map((j) => j._id);

  const applications = await Application.find({ job: { $in: jobIds } })
    .populate("applicant", "name email skills hourlyRate bio location")
    .populate("job", "title company budgetMin budgetMax status")
    .sort("-createdAt");

  res.json({
    applications,
    totalJobs: jobs.length,
    jobs: jobs.map((j) => ({
      _id: j._id,
      title: j.title,
      applicantCount: applications.filter(
        (a) => a.job?._id?.toString() === j._id.toString(),
      ).length,
    })),
  });
});

// ============ GET JOB APPLICATIONS (Job owner) ============
export const getJobApplications = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  const jobOwnerId = job.postedBy.toString();
  const requesterId = req.user._id.toString();

  if (jobOwnerId !== requesterId) {
    res.status(403);
    throw new Error("Not authorized — you are not the job owner");
  }

  const apps = await Application.find({ job: req.params.jobId })
    .populate("applicant", "name email skills hourlyRate bio location")
    .populate("job", "title company budgetMin budgetMax status")
    .sort("-createdAt");

  res.json(apps);
});

// ============ UPDATE APPLICATION STATUS ============
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const app = await Application.findById(req.params.id).populate("job");
  if (!app) {
    res.status(404);
    throw new Error("Application not found");
  }
  if (app.job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  app.status = status;
  await app.save();

  getIO().to(`user:${app.applicant}`).emit("application:status", {
    applicationId: app._id,
    status,
  });

  res.json(app);
});

// ============ WITHDRAW APPLICATION ============
export const withdrawApplication = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) {
    res.status(404);
    throw new Error("Application not found");
  }
  if (app.applicant.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (app.resume?.path && fs.existsSync(app.resume.path)) {
    fs.unlinkSync(app.resume.path);
  }

  await Job.findByIdAndUpdate(app.job, { $inc: { applicantsCount: -1 } });
  await app.deleteOne();
  res.json({ message: "Application withdrawn" });
});

// ============ DOWNLOAD RESUME ============
export const downloadResume = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id).populate("job");
  if (!app) {
    res.status(404);
    throw new Error("Application not found");
  }

  const isOwner = app.job.postedBy.toString() === req.user._id.toString();
  const isApplicant = app.applicant.toString() === req.user._id.toString();
  if (!isOwner && !isApplicant) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (!app.resume?.path || !fs.existsSync(app.resume.path)) {
    res.status(404);
    throw new Error("Resume file not found");
  }

  res.download(app.resume.path, app.resume.originalName);
});
