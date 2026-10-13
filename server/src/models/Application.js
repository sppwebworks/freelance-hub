import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    coverLetter: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    proposedRate: {
      type: Number,
      default: 0,
    },
    proposedRateType: {
      type: String,
      enum: ["fixed", "hourly"],
      default: "fixed",
    },
    estimatedDelivery: {
      type: String,
      default: "",
      maxlength: 100,
    },
    portfolioUrl: {
      type: String,
      default: "",
      maxlength: 500,
    },
    resume: {
      filename: String,
      originalName: String,
      size: Number,
      mimetype: String,
      path: String,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "hired"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
