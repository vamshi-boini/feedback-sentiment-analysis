// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("auth-data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
      } catch {
        localStorage.removeItem("auth-data");
      }
    }
    setInitializing(false);
  }, []);

  const login = (data) => {
    // data expected from backend: { user: {...}, token: "..." }
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("auth-data", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth-data");
  };

  const value = { user, token, login, logout, initializing };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <p className="protected-message">Loading...</p>;
  }

  if (!user) {
    return <p className="protected-message">Please login to continue.</p>;
  }

  return children;
}
