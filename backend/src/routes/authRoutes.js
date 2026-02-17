import express from "express";
import { User } from "../models/User.js";
import { signToken } from "../middleware/auth.js";
import { botDetection } from "../middleware/botDetection.js";

const router = express.Router();

// Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, uniqueId } = req.body;

    if (!name || !email || !password || !uniqueId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingId = await User.findOne({ uniqueId });
    if (existingId) {
      return res.status(400).json({ message: "Unique ID already registered" });
    }

    // Basic fake registration prevention:
    // In real systems, this should be backed by an external registry/verification.
    if (uniqueId.length < 5) {
      return res
        .status(400)
        .json({ message: "Unique ID appears invalid or too short" });
    }

    const user = await User.create({ name, email, password, uniqueId });
    return res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Registration failed" });
  }
});

// Login with bot detection
router.post("/login", botDetection, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLoginAt = new Date();
    user.lastIp =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.ip ||
      req.connection.remoteAddress;
    await user.save();

    const token = signToken(user);

    // Send JWT both as JSON and as httpOnly cookie (defence-in-depth)
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasVoted: user.hasVoted,
        },
        botScore: req.botScore || 0,
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

export default router;


