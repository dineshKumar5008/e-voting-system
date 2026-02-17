import axios from "axios";
import { env } from "../config/env.js";

// Simple in-memory IP tracking for anomaly detection.
// For real deployments, replace with Redis or a persistent store.
const ipMetrics = new Map();

const getIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip || req.connection.remoteAddress;

const updateIpMetrics = (ip) => {
  const now = Date.now();
  const entry = ipMetrics.get(ip) || { count: 0, lastSeen: now };
  entry.count += 1;
  entry.lastSeen = now;
  ipMetrics.set(ip, entry);
  return entry;
};

// Behavioral analysis and IP anomaly scoring
export const botDetection = async (req, res, next) => {
  try {
    const ip = getIp(req);
    const { action, mouseMoves = 0, timeToCompleteMs = 0, recaptchaToken } =
      req.body.botMetrics || {};

    let score = 0;

    // 1. Time-based behaviour: voting or login that's "too fast"
    if (timeToCompleteMs && timeToCompleteMs < 1500) {
      score += 30;
    }

    // 2. Mouse movement heuristic (0 movement is suspicious)
    if (mouseMoves === 0) {
      score += 30;
    } else if (mouseMoves < 5) {
      score += 10;
    }

    // 3. IP-based anomaly detection
    const metrics = updateIpMetrics(ip);
    if (metrics.count > 100) {
      score += 40;
    } else if (metrics.count > 20) {
      score += 15;
    }

    // 4. reCAPTCHA verification (if configured)
    if (env.RECAPTCHA_SECRET && recaptchaToken) {
      try {
        const resp = await axios.post(
          "https://www.google.com/recaptcha/api/siteverify",
          null,
          {
            params: {
              secret: env.RECAPTCHA_SECRET,
              response: recaptchaToken,
              remoteip: ip,
            },
          }
        );

        const data = resp.data;
        if (!data.success || (data.score !== undefined && data.score < 0.5)) {
          score += 40;
        }
      } catch (e) {
        // Fail closed: increase suspicion if reCAPTCHA fails to verify
        score += 20;
      }
    }

    req.botScore = score;

    // If suspicion above threshold, block.
    const threshold = action === "vote" ? 60 : 70;
    if (score > threshold) {
      return res
        .status(403)
        .json({ message: "Bot-like behaviour detected. Action blocked." });
    }

    next();
  } catch (err) {
    // On error, log and allow flow but with high score attached for auditing
    console.error("Bot detection error:", err);
    req.botScore = 50;
    next();
  }
};


