import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "freelancer", skills = [] } = req.body;
  if (await User.findOne({ email })) {
    res.status(409);
    throw new Error("Email already in use");
  }
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    skills,
  });
  res.status(201).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
    },
    token: generateToken(user._id),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
    },
    token: generateToken(user._id),
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, skills, bio, hourlyRate, location } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, skills, bio, hourlyRate, location },
    { new: true, runValidators: true },
  ).select("-password");
  res.json(user);
});
