import crypto from "crypto";
import { env } from "../config/env.js";

const ALGO = "aes-256-gcm";

// Symmetric encryption for vote payloads
export const encryptVote = (plaintext) => {
  const iv = crypto.randomBytes(12);
  const key = Buffer.from(env.ENCRYPTION_KEY, "utf8");

  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
};

export const decryptVote = (ciphertext) => {
  const data = Buffer.from(ciphertext, "base64");
  const iv = data.subarray(0, 12);
  const authTag = data.subarray(12, 28);
  const encrypted = data.subarray(28);

  const key = Buffer.from(env.ENCRYPTION_KEY, "utf8");
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
};

// Create a hash used on-chain to represent a vote (no plaintext candidate)
export const hashVote = (encryptedVote, voterFingerprint) => {
  return crypto
    .createHash("sha256")
    .update(encryptedVote + "|" + voterFingerprint)
    .digest("hex");
};

// Pseudonymous fingerprint of a voter (user id + secret)
export const makeVoterFingerprint = (userId) => {
  return crypto
    .createHmac("sha256", env.ENCRYPTION_KEY)
    .update(userId.toString())
    .digest("hex");
};


