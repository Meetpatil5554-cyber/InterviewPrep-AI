import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-paper mb-2">Welcome back</h1>
        <p className="text-sm text-slate mb-8">Log in to keep your practice streak going.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-inkline/60 border border-inkline px-4 py-3 text-paper focus:border-amber outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-inkline/60 border border-inkline px-4 py-3 text-paper focus:border-amber outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-coral">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-amber text-ink py-3 font-medium hover:bg-amber/90 transition-colors disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-sm text-slate mt-6">
          No account yet?{" "}
          <Link to="/signup" className="text-amber hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
