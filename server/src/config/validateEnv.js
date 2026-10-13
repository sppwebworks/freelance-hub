const REQUIRED = ["PORT", "MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.error("❌ JWT_SECRET must be at least 32 characters");
    process.exit(1);
  }

  console.log("✅ Environment variables validated");
};
