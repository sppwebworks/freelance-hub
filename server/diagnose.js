/**
 * ============================================================
 * DIAGNOSE.JS — FreelanceHub Debug Script
 * ============================================================
 *
 * Checks:
 * 1. Users in DB (clients + freelancers)
 * 2. Jobs in DB + who posted them
 * 3. Applications in DB + who applied to what
 * 4. Ownership mismatches
 * 5. Application-Job-User relationships
 *
 * Run: node diagnose.js
 * ============================================================
 */

import "dotenv/config";
import mongoose from "mongoose";

// Register ALL models before importing
import User from "./src/models/User.js";
import Job from "./src/models/Job.js";
import Application from "./src/models/Application.js";
import SavedJob from "./src/models/SavedJob.js";

const line = "════════════════════════════════════════════════════";
const thin = "────────────────────────────────────────────────────";

const diagnose = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n" + line);
    console.log("🔍 FREELANCEHUB DIAGNOSTIC");
    console.log(line);

    // ==============================================
    // 1. USERS
    // ==============================================
    console.log("\n📊 USERS:\n" + thin);
    const users = await User.find().select("name email role");

    if (users.length === 0) {
      console.log("❌ NO USERS IN DATABASE — run seed.js");
    } else {
      users.forEach((u) => {
        console.log(`  ${u.role === "client" ? "🏢" : "🧑‍💻"} ${u.name}`);
        console.log(`      Email: ${u.email}`);
        console.log(`      Role:  ${u.role}`);
        console.log(`      ID:    ${u._id}`);
        console.log("");
      });
    }

    // ==============================================
    // 2. JOBS
    // ==============================================
    console.log("\n" + line);
    console.log("💼 JOBS:\n" + thin);
    const jobs = await Job.find().populate("postedBy", "name email role");

    if (jobs.length === 0) {
      console.log("❌ NO JOBS IN DATABASE");
    } else {
      jobs.forEach((j) => {
        console.log(`  📋 ${j.title}`);
        console.log(`      Company:   ${j.company}`);
        console.log(`      Job ID:    ${j._id}`);
        console.log(
          `      Posted by: ${j.postedBy?.name} (${j.postedBy?.email})`,
        );
        console.log(`      Owner ID:  ${j.postedBy?._id}`);
        console.log(`      Owner Role: ${j.postedBy?.role}`);
        console.log(`      Applicants: ${j.applicantsCount}`);
        console.log(`      Status:    ${j.status}`);
        console.log("");
      });
    }

    // ==============================================
    // 3. APPLICATIONS
    // ==============================================
    console.log("\n" + line);
    console.log("📨 APPLICATIONS:\n" + thin);
    const applications = await Application.find()
      .populate("job", "title postedBy company")
      .populate("applicant", "name email role");

    if (applications.length === 0) {
      console.log("❌ NO APPLICATIONS IN DATABASE");
      console.log("   → Freelancer never applied, OR");
      console.log("   → Apply request failed (check backend logs)");
    } else {
      applications.forEach((a, i) => {
        console.log(`  #${i + 1} Application ID: ${a._id}`);
        console.log(`      Job:        ${a.job?.title}`);
        console.log(`      Job ID:     ${a.job?._id}`);
        console.log(`      Job Owner:  ${a.job?.postedBy}`);
        console.log(
          `      Applicant:  ${a.applicant?.name} (${a.applicant?.email})`,
        );
        console.log(`      Applicant ID: ${a.applicant?._id}`);
        console.log(`      Applicant Role: ${a.applicant?.role}`);
        console.log(`      Status:     ${a.status}`);
        console.log(
          `      Rate:       $${a.proposedRate} (${a.proposedRateType})`,
        );
        console.log(`      Resume:     ${a.resume?.originalName || "NONE"}`);
        console.log(
          `      Applied:    ${new Date(a.createdAt).toLocaleString()}`,
        );
        console.log("");
      });
    }

    // ==============================================
    // 4. OWNERSHIP ANALYSIS
    // ==============================================
    console.log("\n" + line);
    console.log("🔐 OWNERSHIP ANALYSIS:\n" + thin);

    for (const app of applications) {
      const job = await Job.findById(app.job?._id);
      if (!job) {
        console.log(`  ❌ Application ${app._id} → Job NOT FOUND`);
        continue;
      }

      const jobOwnerId = job.postedBy.toString();
      const applicantId = app.applicant.toString();

      console.log(`  Application for "${job.title}"`);
      console.log(`    Job Owner ID:   ${jobOwnerId}`);
      console.log(`    Applicant ID:   ${applicantId}`);
      console.log(
        `    Same?           ${jobOwnerId === applicantId ? "⚠️ YES (BUG!)" : "✅ No"}`,
      );

      // Who should see this?
      const owner = await User.findById(jobOwnerId);
      const applicant = await User.findById(applicantId);

      console.log(`    Should be visible to: ${owner?.email} (client)`);
      console.log(`    Should be visible to: ${applicant?.email} (applicant)`);
      console.log("");
    }

    // ==============================================
    // 5. CLIENT'S VIEW — What they SHOULD see
    // ==============================================
    console.log("\n" + line);
    console.log("👔 CLIENT VIEW — Applications they should see:\n" + thin);

    const clients = users.filter((u) => u.role === "client");

    for (const client of clients) {
      console.log(`\n  🏢 ${client.name} (${client.email})`);

      const clientJobs = await Job.find({ postedBy: client._id });

      if (clientJobs.length === 0) {
        console.log(`     ❌ Has not posted any jobs`);
        continue;
      }

      console.log(`     📋 Posted ${clientJobs.length} job(s):`);

      for (const j of clientJobs) {
        const appsForJob = await Application.find({ job: j._id });
        console.log(
          `        - "${j.title}" → ${appsForJob.length} application(s)`,
        );
      }
    }

    // ==============================================
    // 6. FREELANCER'S VIEW — What they SHOULD see
    // ==============================================
    console.log("\n" + line);
    console.log("🧑‍💻 FREELANCER VIEW — Applications they sent:\n" + thin);

    const freelancers = users.filter((u) => u.role === "freelancer");

    for (const fl of freelancers) {
      const myApps = await Application.find({ applicant: fl._id }).populate(
        "job",
        "title company",
      );

      console.log(`\n  🧑‍💻 ${fl.name} (${fl.email})`);
      console.log(`     Sent ${myApps.length} application(s)`);

      myApps.forEach((a) => {
        console.log(`        - "${a.job?.title}" @ ${a.job?.company}`);
        console.log(`          Status: ${a.status}`);
      });
    }

    // ==============================================
    // 7. SUMMARY & FIXES
    // ==============================================
    console.log("\n" + line);
    console.log("🎯 SUMMARY:\n" + thin);
    console.log(`  Users:        ${users.length}`);
    console.log(`  Clients:      ${clients.length}`);
    console.log(`  Freelancers:  ${freelancers.length}`);
    console.log(`  Jobs:         ${jobs.length}`);
    console.log(`  Applications: ${applications.length}`);

    // Find the problem
    console.log("\n🔧 DIAGNOSIS:\n" + thin);

    if (applications.length === 0) {
      console.log("  ❌ NO APPLICATIONS");
      console.log("     Cause: Freelancer never successfully applied");
      console.log(
        "     Fix:   Freelancer should apply to a job, then re-run this",
      );
    } else {
      console.log("  ✅ Applications exist in database");

      // Check if applications belong to jobs whose owner is a client
      let mismatchCount = 0;
      for (const app of applications) {
        const job = await Job.findById(app.job?._id).populate("postedBy");
        if (!job) continue;

        if (job.postedBy.role !== "client") {
          console.log(
            `  ⚠️ Job "${job.title}" was posted by a ${job.postedBy.role} (should be client!)`,
          );
          mismatchCount++;
        }
      }

      if (mismatchCount === 0) {
        console.log("  ✅ All jobs were posted by clients");
        console.log(
          "  ✅ Client SHOULD see applications via /jobs/[jobId]/applications",
        );
        console.log("");
        console.log("  If client still can't see them:");
        console.log("    1. Verify client is logged in as the JOB OWNER");
        console.log("    2. Check browser console for errors");
        console.log("    3. Check Network tab for the API response");
        console.log(
          '    4. Verify backend logs show "getJobApplications" being called',
        );
      }
    }

    console.log("\n" + line);
    console.log("✅ DIAGNOSTIC COMPLETE");
    console.log(line + "\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ DIAGNOSTIC ERROR:", err.message);
    console.error(err.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
};

diagnose();
