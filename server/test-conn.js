import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ MONGO_URI not found in .env file");
  process.exit(1);
}

// Safely show the URI with password hidden
const safeUri = uri.replace(/:[^:@]+@/, ":****@");
console.log("🔍 Testing MongoDB connection...");
console.log("   URI:", safeUri);

try {
  await mongoose.connect(uri);
  console.log("✅ Connection successful!");
  console.log("   Host:", mongoose.connection.host);
  console.log("   Database:", mongoose.connection.name);
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error("❌ Connection failed:", err.message);
  process.exit(1);
}
