import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/templates";
import "./Login.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const response = await login(username, password);
    setLoading(false);

    if (response.success) {
      console.log("Login successful");//tesst
      navigate("/"); // Navigate to root which will be protected and show dashboard
    } else {
      setError(response.message || "Login failed. Please check your username or password.");
    }
  };

  return (
    <AuthLayout>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="system-logo">⚡</div>
            <h2>EV Warranty System</h2>
            <p className="sub-text">Internal electric vehicle warranty system</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                required
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
              />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Processing..." : "Login"}
            </button>
          </form>

          <div className="footer-text">© 2025 OEM EV • For internal staff only</div>
        </div>
      </div>
    </AuthLayout>
  );
};

export const Login = LoginPage;
