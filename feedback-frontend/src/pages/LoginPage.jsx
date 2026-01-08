// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { API_BASE_URL } from '../config';
const BASE_URL = API_BASE_URL;


export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // data: { user: {...}, token: "..." }
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!identifier) {
      setError("Enter your email first to reset password.");
      return;
    }
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier }),
      });
      const data = await res.json();
      alert(data.message || "If this email exists, reset instructions were sent.");
    } catch {
      alert("Could not start reset flow. Try again.");
    }
  };

  return (
    <div className="ig-wrapper">
      <div className="ig-card">
        <h1 className="ig-logo">SmartFeedback</h1>

        <form onSubmit={handleSubmit} className="ig-form">
          <input
            type="text"
            placeholder="Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="ig-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>

          <button
            type="button"
            className="ig-link"
            onClick={handleForgot}
          >
            Forgot password?
          </button>

          <div className="ig-or">
            <span />
            <p>or</p>
            <span />
          </div>

          <button
            type="button"
            className="ig-btn-secondary"
            onClick={() => alert("Social login not implemented")}
          >
            Log in with Google
          </button>
        </form>
      </div>

      <div className="ig-bottom-card">
        <p>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="ig-signup-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
