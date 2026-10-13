import asyncHandler from "express-async-handler";
import SavedJob from "../models/SavedJob.js";
import Job from "../models/Job.js";

export const getSaved = asyncHandler(async (req, res) => {
  const saved = await SavedJob.find({ user: req.user._id })
    .populate({ path: "job", populate: { path: "postedBy", select: "name" } })
    .sort("-createdAt");
  res.json(saved.map((s) => ({ ...s.job.toObject(), isSaved: true })));
});

export const toggleSave = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  const existing = await SavedJob.findOne({ user: req.user._id, job: jobId });
  if (existing) {
    await existing.deleteOne();
    await Job.findByIdAndUpdate(jobId, { $inc: { savedCount: -1 } });
    return res.json({ saved: false });
  }
  await SavedJob.create({ user: req.user._id, job: jobId });
  await Job.findByIdAndUpdate(jobId, { $inc: { savedCount: 1 } });
  res.json({ saved: true });
});
