import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/e_voting",
  JWT_SECRET: process.env.JWT_SECRET || "change-this-secret-in-prod",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
  ENCRYPTION_KEY:
    process.env.ENCRYPTION_KEY ||
    "32-char-secret-key-1234567890123456", // 32 chars for AES-256
  RECAPTCHA_SECRET: process.env.RECAPTCHA_SECRET || "",
  NODE_ENV: process.env.NODE_ENV || "development",
};


