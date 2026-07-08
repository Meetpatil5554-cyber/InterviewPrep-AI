import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SAMPLE_QUESTION = "Tell me about a time you disagreed with a teammate.";

function TypingHeadline() {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setShown(SAMPLE_QUESTION.slice(0, i));
      if (i >= SAMPLE_QUESTION.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="font-mono text-sm md:text-base text-teal min-h-[1.5em]">
      {shown}
      <span className="animate-pulse">|</span>
    </p>
  );
}

function Waveform() {
  const bars = Array.from({ length: 24 });
  return (
    <div className="flex items-end gap-1 h-16">
      {bars.map((_, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-amber/70"
          style={{
            height: `${20 + Math.abs(Math.sin(i * 0.7)) * 80}%`,
            animation: `pulse-bar 1.2s ease-in-out ${i * 0.05}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse-bar {
          from { transform: scaleY(0.4); opacity: 0.5; }
          to { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Upload",
    body: "Snap a photo of your resume or a job description. Groq Vision reads it for you.",
  },
  {
    n: "02",
    title: "Generate",
    body: "Groq AI writes interview questions tailored to that exact role.",
  },
  {
    n: "03",
    title: "Practice",
    body: "Answer out loud or in writing. Get a score and specific feedback instantly.",
  },
  {
    n: "04",
    title: "Track",
    body: "Watch your accuracy, streak, and topic mastery climb on your dashboard.",
  },
];

export default function Landing() {
  return (
    <div>
      {/* Hero: the stage */}
      <section className="relative overflow-hidden px-6 md:px-10 pt-16 md:pt-24 pb-20">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #F2A93B 0%, transparent 70%)" }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="uppercase tracking-[0.3em] text-xs text-slate mb-6">
            Practice under the lights, before the real thing
          </p>
          <h1 className="font-display text-4xl md:text-6xl leading-tight text-paper mb-6">
            Walk into your next interview{" "}
            <span className="text-amber">already rehearsed.</span>
          </h1>
          <div className="bg-inkline/60 border border-inkline rounded-2xl px-6 py-5 max-w-xl mx-auto mb-8">
            <p className="text-xs text-slate mb-2 text-left">Interviewer is asking:</p>
            <TypingHeadline />
          </div>
          <div className="flex justify-center mb-10">
            <Waveform />
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-full bg-amber text-ink px-7 py-3 font-medium hover:bg-amber/90 transition-colors"
            >
              Start practicing free
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-slate/40 text-paper px-7 py-3 hover:border-amber hover:text-amber transition-colors"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Process: real sequence, numbering is earned here */}
      <section className="px-6 md:px-10 py-16 border-t border-inkline">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl text-paper mb-10 text-center">
            From upload to offer letter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div key={step.n} className="rounded-2xl border border-inkline p-6">
                <p className="font-mono text-amber text-sm mb-3">{step.n}</p>
                <h3 className="font-display text-lg text-paper mb-2">{step.title}</h3>
                <p className="text-sm text-slate leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="px-6 md:px-10 py-16 border-t border-inkline">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-xl text-teal mb-2">Built on real answers</h3>
            <p className="text-sm text-slate leading-relaxed">
              Questions come from your actual resume and the actual job description, not a generic bank.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl text-teal mb-2">Feedback that's specific</h3>
            <p className="text-sm text-slate leading-relaxed">
              No vague "good job." You get a score and exactly what to sharpen next time.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl text-teal mb-2">Readiness you can see</h3>
            <p className="text-sm text-slate leading-relaxed">
              Your dashboard tracks accuracy, streaks, and mastery per topic so progress is never a guess.
            </p>
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-10 py-10 border-t border-inkline text-center text-xs text-slate">
        InterviewPrep AI — practice like it's the real room.
      </footer>
    </div>
  );
}
