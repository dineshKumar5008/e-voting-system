import mongoose from "mongoose";

// Persisted representation of blocks so the chain survives restarts.

const blockSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
      unique: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    voteHash: {
      type: String,
      required: true,
    },
    previousHash: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Block = mongoose.model("Block", blockSchema);


