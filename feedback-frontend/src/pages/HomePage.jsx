import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <section className="home-hero">
      <div>
        <h1>Smart feedback analytics</h1>
        <p>
          Collect feedback, run sentiment analysis, and explore insights in a
          clean dashboard.
        </p>

        {user ? (
          <div className="hero-actions">
            <Link to="/feedback" className="btn-primary">
              Give feedback
            </Link>
            <Link to="/dashboard" className="btn-outline">
              View dashboard
            </Link>
          </div>
        ) : (
          <div className="hero-actions">
            <Link to="/register" className="btn-primary">
              Get started
            </Link>
            <Link to="/login" className="btn-outline">
              Login
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
