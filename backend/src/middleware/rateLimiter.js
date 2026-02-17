import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const votingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: "Too many voting actions from this IP, please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});


