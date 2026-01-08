// src/pages/FeedbackPage.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import { API_BASE_URL } from '../config';
const BASE_URL = API_BASE_URL;


export default function FeedbackPage() {
  const { token } = useAuth();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("service"); // optional tag
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setSentiment(null);

    try {
      const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, category }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit feedback");
      }

      setSentiment(data.sentiment); // backend returns "positive" | "negative" | "neutral"
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="feedback-section">
      <h1>Submit feedback</h1>
      <p className="feedback-subtitle">
        Share your thoughts. The system will classify them as positive,
        negative, or neutral.
      </p>

      <form className="feedback-form" onSubmit={handleSubmit}>
        <label className="feedback-label">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="service">Service</option>
            <option value="product">Product</option>
            <option value="support">Support</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="feedback-label">
          Feedback message
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your feedback here..."
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button
          type="submit"
          className="btn-primary feedback-btn"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Submit feedback"}
        </button>
      </form>

      {sentiment && (
        <div className={`feedback-result feedback-${sentiment}`}>
          <p>
            Detected sentiment:{" "}
            <strong>{sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</strong>
          </p>
        </div>
      )}
    </section>
  );
}
