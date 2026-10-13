import asyncHandler from "express-async-handler";
import axios from "axios";
import Job from "../models/Job.js";
import SavedJob from "../models/SavedJob.js";
import Application from "../models/Application.js";

// ============================================================
// GET JOBS (Public + filters + pagination)
// ============================================================
export const getJobs = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    skills,
    budgetMin,
    budgetMax,
    experienceLevel,
    isRemote,
    sortBy = "recent",
    page = 1,
    limit = 20,
  } = req.query;

  const query = { status: "open" };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (category) query.category = category;
  if (skills) query.skills = { $in: skills.split(",") };
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (isRemote !== undefined) query.isRemote = isRemote === "true";
  if (budgetMin || budgetMax) {
    query.budgetMax = { $gte: Number(budgetMin) || 0 };
    if (budgetMax) query.budgetMin = { $lte: Number(budgetMax) };
  }

  let sort = { createdAt: -1 };
  if (sortBy === "budget-high") sort = { budgetMax: -1 };
  if (sortBy === "budget-low") sort = { budgetMin: 1 };
  if (sortBy === "oldest") sort = { createdAt: 1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate("postedBy", "name")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Job.countDocuments(query),
  ]);

  let savedIds = [];
  if (req.user) {
    const saved = await SavedJob.find({ user: req.user._id }).select("job");
    savedIds = saved.map((s) => s.job.toString());
  }

  res.json({
    jobs: jobs.map((j) => ({
      ...j.toObject(),
      isSaved: savedIds.includes(j._id.toString()),
    })),
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// ============================================================
// GET FILTER COUNTS (sidebar stats)
// ============================================================
export const getFilterCounts = asyncHandler(async (req, res) => {
  const [categories, experienceLevels, remoteCount, total] = await Promise.all([
    Job.aggregate([
      { $match: { status: "open" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
    Job.aggregate([
      { $match: { status: "open" } },
      { $group: { _id: "$experienceLevel", count: { $sum: 1 } } },
    ]),
    Job.countDocuments({ status: "open", isRemote: true }),
    Job.countDocuments({ status: "open" }),
  ]);

  res.json({
    total,
    remote: remoteCount,
    categories: Object.fromEntries(categories.map((c) => [c._id, c.count])),
    experience: Object.fromEntries(
      experienceLevels.map((e) => [e._id, e.count]),
    ),
  });
});

// ============================================================
// GET MY JOBS (Client — all their posted jobs)
// ⚠️ MUST be defined before /:id route matches
// ============================================================
export const getMyJobs = asyncHandler(async (req, res) => {
  if (req.user.role !== "client") {
    res.status(403);
    throw new Error("Only clients can view their posted jobs");
  }

  const jobs = await Job.find({ postedBy: req.user._id }).sort("-createdAt");

  // Attach pending application count to each job
  const jobsWithStats = await Promise.all(
    jobs.map(async (job) => {
      const pendingCount = await Application.countDocuments({
        job: job._id,
        status: "pending",
      });
      return {
        ...job.toObject(),
        pendingCount,
      };
    }),
  );

  console.log(`📋 getMyJobs: ${jobs.length} jobs for ${req.user.email}`);
  res.json(jobsWithStats);
});

// ============================================================
// GET JOB BY ID (public)
// ============================================================
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    "postedBy",
    "name email _id",
  );

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  let isSaved = false;
  if (req.user) {
    isSaved = !!(await SavedJob.findOne({
      user: req.user._id,
      job: job._id,
    }));
  }

  // Debug log for ownership check
  if (req.user) {
    const ownerId =
      job.postedBy?._id?.toString?.() || job.postedBy?.toString?.();
    console.log("🔍 getJobById:", {
      jobId: job._id.toString(),
      title: job.title,
      ownerId,
      requesterId: req.user._id.toString(),
      isOwner: ownerId === req.user._id.toString(),
    });
  }

  res.json({ ...job.toObject(), isSaved });
});

// ============================================================
// CREATE JOB (Client only)
// ============================================================
export const createJob = asyncHandler(async (req, res) => {
  if (req.user.role !== "client") {
    res.status(403);
    throw new Error("Only clients can post jobs");
  }

  // Validate required fields
  const { title, description, company } = req.body;
  if (!title?.trim()) {
    res.status(400);
    throw new Error("Job title is required");
  }
  if (!description?.trim()) {
    res.status(400);
    throw new Error("Job description is required");
  }
  if (!company?.trim()) {
    res.status(400);
    throw new Error("Company name is required");
  }

  const job = await Job.create({
    ...req.body,
    title: title.trim(),
    description: description.trim(),
    company: company.trim(),
    postedBy: req.user._id,
  });

  res.status(201).json(job);
});

// ============================================================
// UPDATE JOB (Owner only)
// ============================================================
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  if (job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }
  Object.assign(job, req.body);
  await job.save();
  res.json(job);
});

// ============================================================
// DELETE JOB (Owner only — cascades to applications)
// ============================================================
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  if (job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await Promise.all([
    job.deleteOne(),
    SavedJob.deleteMany({ job: job._id }),
    Application.deleteMany({ job: job._id }),
  ]);

  res.json({ message: "Job removed" });
});

// ============================================================
// IMPORT FROM REMOTEOK (Client only — one-time seed)
// ============================================================
export const importFromRemoteOK = asyncHandler(async (req, res) => {
  try {
    const { data } = await axios.get("https://remoteok.com/api");
    const jobs = data.slice(1, 51);
    let imported = 0;

    for (const remoteJob of jobs) {
      const exists = await Job.findOne({
        externalId: remoteJob.id?.toString(),
      });
      if (exists) continue;

      await Job.create({
        title: remoteJob.position,
        description: remoteJob.description || "No description provided.",
        company: remoteJob.company,
        companyLogo: remoteJob.company_logo || "",
        category: "development",
        skills: remoteJob.tags || [],
        budgetMin: 0,
        budgetMax: 0,
        budgetType: "fixed",
        experienceLevel: "intermediate",
        isRemote: true,
        location: remoteJob.location || "Remote",
        postedBy: req.user._id,
        externalId: remoteJob.id?.toString(),
        source: "remoteok",
        status: "open",
      });
      imported++;
    }

    res.json({ imported, total: jobs.length });
  } catch (err) {
    res.status(500);
    throw new Error("Failed to import: " + err.message);
  }
});
