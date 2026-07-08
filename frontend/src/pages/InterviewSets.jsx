import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext.jsx";

export default function InterviewSets() {
  const { user } = useAuth();
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [company, setCompany] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const fetchSets = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("interview_sets")
      .select("*")
      .order("created_at", { ascending: false });
    if (fetchError) setError(fetchError.message);
    else setSets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSets();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const { error: insertError } = await supabase.from("interview_sets").insert({
      user_id: user.id,
      title: title.trim(),
      role_title: roleTitle.trim() || null,
      company: company.trim() || null,
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setTitle("");
    setRoleTitle("");
    setCompany("");
    fetchSets();
  };

  const startEdit = (set) => {
    setEditingId(set.id);
    setEditTitle(set.title);
  };

  const handleUpdate = async (id) => {
    const { error: updateError } = await supabase
      .from("interview_sets")
      .update({ title: editTitle.trim() })
      .eq("id", id);
    if (updateError) setError(updateError.message);
    setEditingId(null);
    fetchSets();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this interview set and all its questions?")) return;
    const { error: deleteError } = await supabase
      .from("interview_sets")
      .delete()
      .eq("id", id);
    if (deleteError) setError(deleteError.message);
    fetchSets();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-12">
      <h1 className="font-display text-3xl text-paper mb-2">Interview Sets</h1>
      <p className="text-sm text-slate mb-8">
        Create a set per role you're targeting, then generate and practice questions inside it.
      </p>

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-inkline bg-inkline/30 p-6 mb-10 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Set title (e.g. Frontend Engineer @ Acme)"
          required
          className="md:col-span-3 rounded-lg bg-ink border border-inkline px-4 py-3 text-paper focus:border-amber outline-none"
        />
        <input
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          placeholder="Role title (optional)"
          className="rounded-lg bg-ink border border-inkline px-4 py-3 text-paper focus:border-amber outline-none"
        />
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company (optional)"
          className="rounded-lg bg-ink border border-inkline px-4 py-3 text-paper focus:border-amber outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-amber text-ink font-medium py-3 hover:bg-amber/90 transition-colors"
        >
          Create set
        </button>
      </form>

      {error && <p className="text-sm text-coral mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate text-sm">Loading...</p>
      ) : sets.length === 0 ? (
        <p className="text-slate text-sm">
          No interview sets yet. Create one above to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {sets.map((set) => (
            <div
              key={set.id}
              className="rounded-2xl border border-inkline p-5 flex items-center justify-between gap-4"
            >
              <div className="flex-1">
                {editingId === set.id ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg bg-ink border border-inkline px-3 py-2 text-paper focus:border-amber outline-none"
                  />
                ) : (
                  <>
                    <h3 className="font-display text-lg text-paper">{set.title}</h3>
                    <p className="text-xs text-slate mt-1">
                      {[set.role_title, set.company].filter(Boolean).join(" · ") || "No details added"}
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {editingId === set.id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(set.id)}
                      className="text-sm rounded-full bg-teal text-ink px-4 py-1.5 font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-sm text-slate hover:text-paper px-2"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/sets/${set.id}/practice`}
                      className="text-sm rounded-full bg-amber text-ink px-4 py-1.5 font-medium hover:bg-amber/90"
                    >
                      Practice
                    </Link>
                    <button
                      onClick={() => startEdit(set)}
                      className="text-sm text-slate hover:text-paper px-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(set.id)}
                      className="text-sm text-coral hover:text-coral/80 px-2"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
