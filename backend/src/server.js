import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const server = http.createServer(app);

const start = async () => {
  await connectDB();

  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});


