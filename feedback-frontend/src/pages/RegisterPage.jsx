// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://127.0.0.1:5000";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
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
      const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,   // backend expects fullName or name
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // backend returns { user, token }
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ig-wrapper">
      <div className="ig-card">
        <h1 className="ig-logo">SmartFeedback</h1>
        <p className="ig-subtitle">
          Sign up to submit feedback and view sentiment insights.
        </p>

        <form onSubmit={handleSubmit} className="ig-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="ig-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
      </div>

      <div className="ig-bottom-card">
        <p>
          Have an account?{" "}
          <Link to="/login" className="ig-signup-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
