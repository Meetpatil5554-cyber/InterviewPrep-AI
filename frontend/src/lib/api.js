const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  generateQuestions: (sourceText, roleTitle, count) =>
    post("/api/groq/generate-questions", { sourceText, roleTitle, count }),
  scoreAnswer: (question, answer) =>
    post("/api/groq/score-answer", { question, answer }),
  extractTextFromImage: (imageBase64) =>
    post("/api/vision/extract-text", { imageBase64 }),
  sendReminder: (toEmail, name, stats) =>
    post("/api/resend/send-reminder", { toEmail, name, stats }),
};
