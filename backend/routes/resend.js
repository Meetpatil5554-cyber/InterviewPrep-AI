import express from "express";
import { Resend } from "resend";

const router = express.Router();

router.post("/send-reminder", async (req, res) => {
  try {
    const { toEmail, name, stats } = req.body;
    if (!toEmail) return res.status(400).json({ error: "toEmail is required" });

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: toEmail,
      subject: "Your InterviewPrep AI check-in",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color:#12172B;">Hi ${name || "there"} 👋</h2>
          <p>Here's your practice snapshot:</p>
          <ul>
            <li>Questions answered: ${stats?.questionsAnswered ?? 0}</li>
            <li>Average score: ${stats?.avgScore ?? "—"}</li>
            <li>Current streak: ${stats?.streak ?? 0} days</li>
          </ul>
          <p>Jump back in and keep your streak alive!</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: error.message || JSON.stringify(error) });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;