import express from "express";
import { authRequired } from "../middleware/auth.js";
import { botDetection } from "../middleware/botDetection.js";
import { User } from "../models/User.js";
import { Vote } from "../models/Vote.js";
import { encryptVote, hashVote, makeVoterFingerprint } from "../utils/crypto.js";
import { blockchain } from "../blockchain/blockchain.js";

const router = express.Router();

// Ensure blockchain is initialised once at startup
blockchain.init().catch((err) =>
  console.error("Blockchain init error (vote routes):", err)
);

// Cast a vote
router.post("/", authRequired, botDetection, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.hasVoted) {
      return res.status(400).json({ message: "User has already voted" });
    }

    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ message: "candidateId is required" });
    }

    // 1. Encrypt the vote payload (candidateId + random salt)
    const payload = JSON.stringify({
      candidateId,
      salt: Date.now().toString(),
    });
    const encryptedVote = encryptVote(payload);

    // 2. Build voter fingerprint to detect double-voting without exposing user id
    const voterFingerprint = makeVoterFingerprint(user._id.toString());

    // 3. Hash for blockchain storage (no plaintext voting data)
    const voteHash = hashVote(encryptedVote, voterFingerprint);

    // 4. Store minimal reference in MongoDB
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.ip ||
      req.connection.remoteAddress;

    const vote = await Vote.create({
      encryptedVote,
      voteHash,
      voterFingerprint,
      ipAddress,
      botScore: req.botScore || 0,
    });

    // 5. Append block to blockchain
    await blockchain.addBlock(voteHash);

    // 6. Mark user as having voted
    user.hasVoted = true;
    await user.save();

    return res.status(201).json({ message: "Vote cast successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to cast vote" });
  }
});

// Summary for transparency dashboard
router.get("/stats", async (req, res) => {
  try {
    const totalVotes = await Vote.countDocuments();
    return res.json({ totalVotes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
});

export default router;


