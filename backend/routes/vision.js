import express from "express";

const router = express.Router();
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const VISION_MODEL = "qwen/qwen3.6-27b";

// Accepts a base64 image (data URL) and returns extracted text
router.post("/extract-text", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Extract all readable text from this resume or job description image. " +
                  "Return plain text only, preserving section structure (Experience, Skills, " +
                  "Education, etc.) as best you can. Do not add commentary.",
              },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Groq Vision error (${response.status}): ${text}`);
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content ?? "";
    res.json({ extractedText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
