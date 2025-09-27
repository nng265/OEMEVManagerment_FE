// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/NetworkUntil";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(username.trim(), password.trim());
    setLoading(false);

    if (res.success) {
      localStorage.setItem("token", "fake-token");
      localStorage.setItem("user", JSON.stringify(res.user));
      navigate("/dashboard");
    } else {
      setError(res.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="card login-card p-4">
        <h1 className="text-center mb-4">Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-danger">{error}</p>}

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
