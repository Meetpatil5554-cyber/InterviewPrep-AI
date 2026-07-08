import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error: signUpError } = await signUp(email, password, fullName);
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setMessage("Account created! Check your email to confirm, then log in.");
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-paper mb-2">Create your account</h1>
        <p className="text-sm text-slate mb-8">Start rehearsing for the room you're walking into.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate mb-2">
              Full name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg bg-inkline/60 border border-inkline px-4 py-3 text-paper focus:border-amber outline-none"
              placeholder="Jane Doe"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-inkline/60 border border-inkline px-4 py-3 text-paper focus:border-amber outline-none"
              placeholder="At least 6 characters"
            />
          </div>

          {error && <p className="text-sm text-coral">{error}</p>}
          {message && <p className="text-sm text-teal">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-amber text-ink py-3 font-medium hover:bg-amber/90 transition-colors disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-slate mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-amber hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
