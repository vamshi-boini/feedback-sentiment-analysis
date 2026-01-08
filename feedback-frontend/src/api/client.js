import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://127.0.0.1:5000"; // Flask

export function useApi() {
  const { token } = useAuth();

  const request = async (path, options = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  return { request };
}
