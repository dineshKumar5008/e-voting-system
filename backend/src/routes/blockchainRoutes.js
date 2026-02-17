import express from "express";
import { blockchain } from "../blockchain/blockchain.js";
import { Block } from "../models/Block.js";

const router = express.Router();

// Get a high-level view of the chain (no vote data, only hashes)
router.get("/", async (req, res) => {
  try {
    const blocks = await Block.find().sort({ index: 1 }).select("-_id -__v");
    res.json({ length: blocks.length, blocks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch blockchain" });
  }
});

// Verify entire chain integrity
router.get("/verify", async (req, res) => {
  try {
    const result = await blockchain.isChainValid();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify blockchain" });
  }
});

export default router;


