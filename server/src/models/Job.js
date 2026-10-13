import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 5000 },
    company: { type: String, required: true, trim: true },
    companyLogo: { type: String, default: "" },
    category: {
      type: String,
      enum: ["development", "design", "marketing", "writing", "other"],
      default: "development",
    },
    skills: { type: [String], default: [] },
    budgetMin: { type: Number, default: 0 },
    budgetMax: { type: Number, default: 0 },
    budgetType: { type: String, enum: ["fixed", "hourly"], default: "fixed" },
    experienceLevel: {
      type: String,
      enum: ["entry", "intermediate", "expert"],
      default: "intermediate",
    },
    location: { type: String, default: "Remote" },
    isRemote: { type: Boolean, default: true },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    applicantsCount: { type: Number, default: 0 },
    savedCount: { type: Number, default: 0 },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    externalId: { type: String, unique: true, sparse: true },
    source: { type: String, default: "internal" },
  },
  { timestamps: true },
);

export default mongoose.model("Job", jobSchema);
