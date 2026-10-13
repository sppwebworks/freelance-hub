/**
 * ============================================================
 * FREELANCEHUB — SEED SCRIPT
 * ============================================================
 *
 * Purpose: Populates MongoDB with demo data
 *
 * Run: node seed.js
 *
 * Creates:
 *   - 2 users (client + freelancer)
 *   - 10 sample jobs
 *
 * Login:
 *   client@freelance.com     / password123
 *   freelancer@freelance.com / password123
 * ============================================================
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";
import Job from "./src/models/Job.js";

const SAMPLE_JOBS = [
  {
    title: "Senior React Developer",
    description:
      "We need an experienced React developer to build a SaaS dashboard. Must know Redux Toolkit, modern hooks, and TypeScript.",
    company: "TechFlow Inc",
    category: "development",
    skills: ["React", "Redux", "TypeScript", "Tailwind"],
    budgetMin: 4000,
    budgetMax: 8000,
    budgetType: "fixed",
    experienceLevel: "expert",
  },
  {
    title: "UI/UX Designer for Mobile App",
    description:
      "Design a clean mobile app for a fintech startup. Deliver Figma files with components, styles, and prototypes.",
    company: "FinPay",
    category: "design",
    skills: ["Figma", "Mobile Design", "iOS"],
    budgetMin: 2500,
    budgetMax: 5000,
    budgetType: "fixed",
    experienceLevel: "intermediate",
  },
  {
    title: "Node.js Backend Engineer",
    description:
      "Build a scalable REST API with Express and MongoDB. Must understand JWT auth, caching, and rate limiting.",
    company: "DataStream",
    category: "development",
    skills: ["Node.js", "Express", "MongoDB", "JWT"],
    budgetMin: 50,
    budgetMax: 90,
    budgetType: "hourly",
    experienceLevel: "expert",
  },
  {
    title: "Content Writer — Tech Blog",
    description:
      "Write 10 long-form articles on AI and developer tools. SEO optimized, 1500+ words each.",
    company: "DevMedia",
    category: "writing",
    skills: ["Content Writing", "SEO", "AI"],
    budgetMin: 800,
    budgetMax: 1500,
    budgetType: "fixed",
    experienceLevel: "intermediate",
  },
  {
    title: "Social Media Manager",
    description:
      "Run our Twitter, LinkedIn, and Instagram accounts for a B2B SaaS. Create content calendars and engage daily.",
    company: "CloudBase",
    category: "marketing",
    skills: ["Social Media", "Content", "Analytics"],
    budgetMin: 1500,
    budgetMax: 3000,
    budgetType: "fixed",
    experienceLevel: "entry",
  },
  {
    title: "Full-Stack MERN Developer",
    description:
      "Build a marketplace MVP. React frontend, Node backend, Stripe integration, real-time chat.",
    company: "Marketplace.io",
    category: "development",
    skills: ["React", "Node", "MongoDB", "Stripe"],
    budgetMin: 6000,
    budgetMax: 12000,
    budgetType: "fixed",
    experienceLevel: "expert",
  },
  {
    title: "Logo & Brand Identity Designer",
    description:
      "Design logo, business cards, letterhead for a new consulting firm.",
    company: "Apex Consulting",
    category: "design",
    skills: ["Illustrator", "Branding", "Logo Design"],
    budgetMin: 500,
    budgetMax: 1200,
    budgetType: "fixed",
    experienceLevel: "intermediate",
  },
  {
    title: "DevOps Engineer",
    description:
      "Set up CI/CD with GitHub Actions, deploy to AWS, monitor with Grafana.",
    company: "ScaleOps",
    category: "development",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    budgetMin: 70,
    budgetMax: 120,
    budgetType: "hourly",
    experienceLevel: "expert",
  },
  {
    title: "Email Marketing Specialist",
    description:
      "Design and run email campaigns. Must know Mailchimp and automation.",
    company: "GrowthLab",
    category: "marketing",
    skills: ["Email Marketing", "Mailchimp"],
    budgetMin: 1000,
    budgetMax: 2500,
    budgetType: "fixed",
    experienceLevel: "intermediate",
  },
  {
    title: "Mobile App Developer (React Native)",
    description:
      "Build a cross-platform fitness tracking app. REST API integration, offline support.",
    company: "FitTrack",
    category: "development",
    skills: ["React Native", "Redux", "REST API"],
    budgetMin: 5000,
    budgetMax: 10000,
    budgetType: "fixed",
    experienceLevel: "expert",
  },
];

const seed = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected:", mongoose.connection.host);

    // Clear existing data
    console.log("\n🧹 Clearing existing data...");
    await Promise.all([User.deleteMany({}), Job.deleteMany({})]);
    console.log("✅ Cleared");

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 12);

    // Create users
    console.log("\n👥 Creating users...");
    const [client, freelancer] = await User.insertMany([
      {
        name: "Demo Client",
        email: "client@freelance.com",
        password: hashedPassword,
        role: "client",
        location: "Remote",
      },
      {
        name: "Demo Freelancer",
        email: "freelancer@freelance.com",
        password: hashedPassword,
        role: "freelancer",
        skills: ["React", "Node.js", "MongoDB", "TypeScript"],
        bio: "Full-stack developer with 5 years of experience building web apps.",
        hourlyRate: 75,
        location: "Bangalore, India",
      },
    ]);
    console.log(`✅ Created ${2} users`);

    // Create jobs (posted by the client)
    console.log("\n💼 Creating jobs...");
    for (const jobData of SAMPLE_JOBS) {
      await Job.create({
        ...jobData,
        postedBy: client._id,
        isRemote: true,
        location: "Remote",
        status: "open",
        source: "internal",
      });
    }
    console.log(`✅ Created ${SAMPLE_JOBS.length} jobs`);

    // Summary
    const userCount = await User.countDocuments();
    const jobCount = await Job.countDocuments();

    console.log("\n═══════════════════════════════════════════");
    console.log("🎉 SEED COMPLETE");
    console.log("═══════════════════════════════════════════");
    console.log(`   Users: ${userCount}`);
    console.log(`   Jobs:  ${jobCount}`);
    console.log("═══════════════════════════════════════════");
    console.log("");
    console.log("🔑 Login Credentials:");
    console.log("   👔 Client:");
    console.log("      Email:    client@freelance.com");
    console.log("      Password: password123");
    console.log("");
    console.log("   👨‍💻 Freelancer:");
    console.log("      Email:    freelancer@freelance.com");
    console.log("      Password: password123");
    console.log("");
    console.log("🌐 Open: http://localhost:5173/login");
    console.log("");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seed error:", err.message);
    if (err.stack) console.error(err.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
