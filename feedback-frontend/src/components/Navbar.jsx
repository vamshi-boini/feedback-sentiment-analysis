import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="nav-header">
      <div className="nav-inner">
        <div className="nav-left">
          <Link to="/" className="brand">SmartFeedback</Link>
          <nav className="nav-links">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/feedback">Feedback</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </nav>
        </div>
        <div className="nav-right">
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name}</span>
              <button className="btn-outline" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-text">Login</NavLink>
              <NavLink to="/register" className="btn-primary">Sign up</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
