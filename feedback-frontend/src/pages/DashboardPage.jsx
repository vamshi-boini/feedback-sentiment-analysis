// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PieChart } from "react-minimal-pie-chart";

const BASE_URL = "http://127.0.0.1:5000";

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/summary`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load summary");
        setSummary(data); // { total, positive, neutral, negative }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  return (
    <section className="dash-section">
      <h1>Sentiment dashboard</h1>
      <p className="dash-subtitle">
        Overview of positive, neutral, and negative feedback stored in the
        system.
      </p>

      {loading && <p>Loading statistics...</p>}
      {error && <p className="auth-error">{error}</p>}

      {summary && summary.total > 0 && (
        <div className="dash-grid">
          <div className="dash-card">
            <h2>Summary</h2>
            <ul>
              <li>Total feedback: {summary.total}</li>
              <li>Positive: {summary.positive}</li>
              <li>Neutral: {summary.neutral}</li>
              <li>Negative: {summary.negative}</li>
            </ul>
          </div>

          <div className="dash-card dash-chart-card">
            <h2>Sentiment split</h2>
            <PieChart
              data={[
                {
                  title: "Positive",
                  value: summary.positive,
                  color: "#22c55e",
                },
                {
                  title: "Neutral",
                  value: summary.neutral,
                  color: "#9ca3af",
                },
                {
                  title: "Negative",
                  value: summary.negative,
                  color: "#ef4444",
                },
              ]}
              animate
              paddingAngle={2}
              lineWidth={45}
              label={({ dataEntry }) =>
                dataEntry.value > 0
                  ? `${dataEntry.title} ${Math.round(
                      (dataEntry.value / summary.total) * 100
                    )}%`
                  : ""
              }
              labelStyle={{
                fontSize: "5px",
                fill: "#0f172a",
              }}
            />
          </div>
        </div>
      )}

      {summary && summary.total === 0 && !loading && !error && (
        <p>No feedback submitted yet. Try adding some feedback first.</p>
      )}
    </section>
  );
}
