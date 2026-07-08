import express from "express";

const router = express.Router();
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const TEXT_MODEL = "openai/gpt-oss-120b";

async function callGroq(messages, jsonMode = false) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      messages,
      temperature: 0.6,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// Generate interview questions from resume/JD text
router.post("/generate-questions", async (req, res) => {
  try {
    const { sourceText, roleTitle, count = 6 } = req.body;
    if (!sourceText) return res.status(400).json({ error: "sourceText is required" });

    const content = await callGroq(
      [
        {
          role: "system",
          content:
            "You are an expert technical interviewer. Given resume/job description text, " +
            "generate realistic interview questions. Respond ONLY with JSON, no markdown, " +
            'in the shape: {"questions":[{"question":"...","topic":"...","difficulty":"easy|medium|hard"}]}',
        },
        {
          role: "user",
          content: `Role: ${roleTitle || "Not specified"}\n\nResume/JD text:\n${sourceText}\n\nGenerate ${count} interview questions.`,
        },
      ],
      true
    );

    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Score + give feedback on a practice answer
router.post("/score-answer", async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: "question and answer are required" });
    }

    const content = await callGroq(
      [
        {
          role: "system",
          content:
            "You are a supportive but honest interview coach. Score the candidate's answer " +
            "from 0-100 and give 2-3 sentences of specific, actionable feedback. Respond ONLY " +
            'with JSON: {"score": number, "feedback": "..."}',
        },
        {
          role: "user",
          content: `Question: ${question}\n\nCandidate's answer: ${answer}`,
        },
      ],
      true
    );

    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
