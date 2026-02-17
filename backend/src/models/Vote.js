import mongoose from "mongoose";

// This collection stores encrypted votes and minimal metadata.
// We do NOT store plain candidate choices or direct user identifiers here.

const voteSchema = new mongoose.Schema(
  {
    // Encrypted vote payload (e.g., AES-encrypted candidate choice + salt)
    encryptedVote: {
      type: String,
      required: true,
    },
    // Hash that is stored in the blockchain for integrity
    voteHash: {
      type: String,
      required: true,
      unique: true,
    },
    // Pseudonymous reference so we can audit double-voting without linking
    voterFingerprint: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: String,
    botScore: Number,
  },
  { timestamps: true }
);

export const Vote = mongoose.model("Vote", voteSchema);


