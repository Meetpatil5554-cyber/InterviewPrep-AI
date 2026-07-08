import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import InterviewSets from "./pages/InterviewSets.jsx";
import Practice from "./pages/Practice.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sets"
          element={
            <ProtectedRoute>
              <InterviewSets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sets/:setId/practice"
          element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
