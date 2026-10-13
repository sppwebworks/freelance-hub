import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["freelancer", "client"],
      default: "freelancer",
    },
    skills: { type: [String], default: [] },
    bio: { type: String, default: "", maxlength: 500 },
    hourlyRate: { type: Number, default: 0 },
    location: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
