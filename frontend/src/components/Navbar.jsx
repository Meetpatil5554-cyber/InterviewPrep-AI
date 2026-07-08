import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="w-full px-6 md:px-10 py-5 flex items-center justify-between border-b border-inkline">
      <Link to="/" className="font-display text-xl tracking-tight text-paper">
        InterviewPrep <span className="text-amber">AI</span>
      </Link>

      <div className="flex items-center gap-6 text-sm">
        {user ? (
          <>
            <Link to="/dashboard" className="text-slate hover:text-paper transition-colors">
              Dashboard
            </Link>
            <Link to="/sets" className="text-slate hover:text-paper transition-colors">
              Interview Sets
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-slate/40 px-4 py-1.5 text-paper hover:border-amber hover:text-amber transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate hover:text-paper transition-colors">
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-amber text-ink px-4 py-1.5 font-medium hover:bg-amber/90 transition-colors"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
