import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api";
import StatCard from "../components/StatCard.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendStatus, setSendStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      const [{ data: attemptsData }, { data: sessionsData }] = await Promise.all([
        supabase
          .from("attempts")
          .select("*, questions(topic)")
          .order("created_at", { ascending: true }),
        supabase
          .from("practice_sessions")
          .select("*")
          .order("created_at", { ascending: true }),
      ]);
      setAttempts(attemptsData || []);
      setSessions(sessionsData || []);
      setLoading(false);
    };
    load();
  }, []);

  const accuracyTrend = useMemo(
    () =>
      attempts.map((a, i) => ({
        name: `Q${i + 1}`,
        score: a.score,
      })),
    [attempts]
  );

  const minutesPerDay = useMemo(() => {
    const byDay = {};
    sessions.forEach((s) => {
      const day = new Date(s.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      byDay[day] = (byDay[day] || 0) + Math.round((s.duration_seconds || 0) / 60);
    });
    return Object.entries(byDay).map(([name, minutes]) => ({ name, minutes }));
  }, [sessions]);

  const masteryByTopic = useMemo(() => {
    const byTopic = {};
    attempts.forEach((a) => {
      const topic = a.questions?.topic || "General";
      if (!byTopic[topic]) byTopic[topic] = { total: 0, count: 0 };
      byTopic[topic].total += a.score || 0;
      byTopic[topic].count += 1;
    });
    return Object.entries(byTopic).map(([topic, { total, count }]) => ({
      topic,
      mastery: Math.round(total / count),
    }));
  }, [attempts]);

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length)
    : 0;

  const streak = useMemo(() => {
    const days = new Set(
      sessions.map((s) => new Date(s.created_at).toDateString())
    );
    let count = 0;
    let cursor = new Date();
    while (days.has(cursor.toDateString())) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [sessions]);

  const handleSendReminder = async () => {
    setSendStatus("Sending...");
    try {
      await api.sendReminder(user.email, user.user_metadata?.full_name, {
        questionsAnswered: attempts.length,
        avgScore,
        streak,
      });
      setSendStatus("Reminder sent! Check your inbox.");
    } catch (err) {
      setSendStatus(`Failed: ${err.message}`);
    }
  };

  if (loading) {
    return <p className="text-slate text-center py-20">Loading your dashboard...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-paper mb-1">Your readiness</h1>
          <p className="text-sm text-slate">Everything you've practiced, in one view.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSendReminder}
            className="text-sm rounded-full border border-slate/40 px-4 py-2 text-paper hover:border-amber hover:text-amber transition-colors"
          >
            Email me a check-in
          </button>
        </div>
      </div>
      {sendStatus && <p className="text-sm text-teal mb-6">{sendStatus}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatCard label="Questions answered" value={attempts.length} accent="amber" />
        <StatCard label="Average score" value={`${avgScore}`} accent="teal" />
        <StatCard label="Current streak" value={`${streak}d`} accent="coral" />
      </div>

      {attempts.length === 0 ? (
        <div className="rounded-2xl border border-inkline p-10 text-center">
          <p className="text-slate">
            No practice data yet. Head to an interview set and answer a few questions
            to see your charts fill in.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="rounded-2xl border border-inkline p-6">
            <h2 className="font-display text-lg text-paper mb-4">Accuracy over time</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D2440" />
                <XAxis dataKey="name" stroke="#8A93B2" fontSize={12} />
                <YAxis stroke="#8A93B2" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "#1D2440", border: "none", borderRadius: 8 }}
                />
                <Line type="monotone" dataKey="score" stroke="#F2A93B" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-inkline p-6">
              <h2 className="font-display text-lg text-paper mb-4">Practice minutes / day</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={minutesPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1D2440" />
                  <XAxis dataKey="name" stroke="#8A93B2" fontSize={12} />
                  <YAxis stroke="#8A93B2" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "#1D2440", border: "none", borderRadius: 8 }}
                  />
                  <Bar dataKey="minutes" fill="#2BB3A3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-inkline p-6">
              <h2 className="font-display text-lg text-paper mb-4">Mastery by topic</h2>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={masteryByTopic}>
                  <PolarGrid stroke="#1D2440" />
                  <PolarAngleAxis dataKey="topic" stroke="#8A93B2" fontSize={11} />
                  <PolarRadiusAxis stroke="#1D2440" domain={[0, 100]} />
                  <Radar dataKey="mastery" stroke="#F2A93B" fill="#F2A93B" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
