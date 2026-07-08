import express from "express";
import cors from "cors";
import "dotenv/config";

import groqRoutes from "./routes/groq.js";
import visionRoutes from "./routes/vision.js";
import resendRoutes from "./routes/resend.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "10mb" })); // 10mb to allow base64 images

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/groq", groqRoutes);
app.use("/api/vision", visionRoutes);
app.use("/api/resend", resendRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`InterviewPrep AI backend running on http://localhost:${PORT}`);
});
