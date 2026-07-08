import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Practice() {
  const { setId } = useParams();
  const { user } = useAuth();

  const [set, setSet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [scoring, setScoring] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [{ data: setData, error: setError_ }, { data: qData, error: qError }] =
      await Promise.all([
        supabase.from("interview_sets").select("*").eq("id", setId).single(),
        supabase
          .from("questions")
          .select("*, attempts(score, feedback, created_at)")
          .eq("set_id", setId)
          .order("created_at", { ascending: true }),
      ]);
    if (setError_) setError(setError_.message);
    if (qError) setError(qError.message);
    setSet(setData);
    setQuestions(qData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("Reading image with Groq Vision...");
    setError("");
    try {
      const base64 = await fileToBase64(file);
      const { extractedText } = await api.extractTextFromImage(base64);

      await supabase
        .from("interview_sets")
        .update({ source_text: extractedText })
        .eq("id", setId);

      setStatus("Text extracted. Generating questions with Groq AI...");
      const { questions: generated } = await api.generateQuestions(
        extractedText,
        set?.role_title,
        6
      );

      const rows = generated.map((q) => ({
        set_id: setId,
        user_id: user.id,
        question: q.question,
        topic: q.topic,
        difficulty: q.difficulty,
      }));
      const { error: insertError } = await supabase.from("questions").insert(rows);
      if (insertError) throw insertError;

      setStatus("Done! Your questions are ready below.");
      loadData();
    } catch (err) {
      setError(err.message);
      setStatus("");
    }
  };

  const openQuestion = (q) => {
    setActiveQuestion(q);
    setAnswer("");
    setFeedback(null);
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !activeQuestion) return;
    setScoring(true);
    setError("");
    try {
      const result = await api.scoreAnswer(activeQuestion.question, answer);
      setFeedback(result);

      const { error: insertError } = await supabase.from("attempts").insert({
        question_id: activeQuestion.id,
        user_id: user.id,
        answer_text: answer,
        score: result.score,
        feedback: result.feedback,
      });
      if (insertError) throw insertError;

      await supabase.from("practice_sessions").insert({
        user_id: user.id,
        set_id: setId,
        duration_seconds: 120,
        questions_answered: 1,
        avg_score: result.score,
      });

      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setScoring(false);
    }
  };

  const deleteQuestion = async (id) => {
    if (!confirm("Delete this question?")) return;
    await supabase.from("questions").delete().eq("id", id);
    loadData();
  };

  if (loading) {
    return <p className="text-slate text-center py-20">Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-12">
      <h1 className="font-display text-3xl text-paper mb-1">{set?.title}</h1>
      <p className="text-sm text-slate mb-8">
        {[set?.role_title, set?.company].filter(Boolean).join(" · ") || "Practice session"}
      </p>

      <div className="rounded-2xl border border-inkline bg-inkline/30 p-6 mb-10">
        <h2 className="font-display text-lg text-paper mb-2">
          1. Upload resume or job description photo
        </h2>
        <p className="text-sm text-slate mb-4">
          Groq Vision reads the image, then Groq AI generates questions from it.
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="text-sm text-slate file:mr-4 file:rounded-full file:border-0 file:bg-amber file:text-ink file:px-4 file:py-2 file:font-medium"
        />
        {status && <p className="text-sm text-teal mt-3">{status}</p>}
        {error && <p className="text-sm text-coral mt-3">{error}</p>}
      </div>

      <h2 className="font-display text-lg text-paper mb-4">2. Questions</h2>
      {questions.length === 0 ? (
        <p className="text-sm text-slate mb-10">
          No questions yet — upload a photo above to generate some.
        </p>
      ) : (
        <div className="space-y-3 mb-10">
          {questions.map((q) => {
            const lastAttempt = q.attempts?.[q.attempts.length - 1];
            return (
              <div
                key={q.id}
                className="rounded-xl border border-inkline p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-paper">{q.question}</p>
                  <p className="text-xs text-slate mt-1">
                    {q.topic || "General"} · {q.difficulty}
                    {lastAttempt && (
                      <span className="text-teal"> · last score {lastAttempt.score}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openQuestion(q)}
                    className="text-sm rounded-full bg-amber text-ink px-4 py-1.5 font-medium hover:bg-amber/90"
                  >
                    Practice
                  </button>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="text-sm text-coral hover:text-coral/80 px-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeQuestion && (
        <div className="rounded-2xl border border-amber/40 bg-inkline/30 p-6">
          <h3 className="font-display text-lg text-paper mb-3">{activeQuestion.question}</h3>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            placeholder="Type your answer..."
            className="w-full rounded-lg bg-ink border border-inkline px-4 py-3 text-paper focus:border-amber outline-none mb-4"
          />
          <button
            onClick={submitAnswer}
            disabled={scoring || !answer.trim()}
            className="rounded-full bg-teal text-ink px-6 py-2.5 font-medium hover:bg-teal/90 transition-colors disabled:opacity-60"
          >
            {scoring ? "Scoring with Groq AI..." : "Submit answer"}
          </button>

          {feedback && (
            <div className="mt-5 rounded-xl bg-ink border border-inkline p-4">
              <p className="font-mono text-2xl text-amber mb-2">{feedback.score}/100</p>
              <p className="text-sm text-slate leading-relaxed">{feedback.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
