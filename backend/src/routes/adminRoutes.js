import express from "express";
import { authRequired, requireAdmin } from "../middleware/auth.js";
import { Vote } from "../models/Vote.js";
import { User } from "../models/User.js";

const router = express.Router();

// Admin dashboard metrics
router.get(
  "/stats",
  authRequired,
  requireAdmin,
  async (req, res) => {
    try {
      const [totalVotes, totalUsers, votedUsers] = await Promise.all([
        Vote.countDocuments(),
        User.countDocuments(),
        User.countDocuments({ hasVoted: true }),
      ]);

      res.json({
        totalVotes,
        totalUsers,
        votedUsers,
        turnoutPercent: totalUsers ? (votedUsers / totalUsers) * 100 : 0,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  }
);

export default router;


