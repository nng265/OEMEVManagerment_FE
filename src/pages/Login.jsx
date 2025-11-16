// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// Assuming Button and Input are correctly exported from their paths
import { Button } from "../components/atoms/Button/Button";
import { Input } from "../components/atoms/Input/Input";
import { GoogleLogin } from "@react-oauth/google";
import { request, ApiEnum } from "../services/NetworkUntil";
import "./Login.css"; // Make sure the path is correct

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Start loading

    try {
      // Use the login function from context
      const loginResult = await login(formData.username, formData.password);

      if (loginResult && loginResult.success) {
        // Get user data from localStorage to check role
        const userData = JSON.parse(localStorage.getItem("user"));

        // Redirect based on role
        if (userData && userData.role === "EVM_STAFF") {
          navigate("/dashboardevmstaff");
        } else if (userData && userData.role === "SC_TECH") {
          navigate("/overview");
        } else {
          navigate("/dashboard"); // SC_STAFF or other roles
        }
      } else {
        // Use message from loginResult or a default one
        setError(loginResult?.message || "Invalid username or password.");
      }
    } catch (err) {
      console.error("Login page error:", err);
      // Use error message or a generic one
      setError(
        err?.message || "An error occurred during login. Please try again."
      );
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse || !credentialResponse.credential) {
      setError("Google credential not found");
      return;
    }

    try {
      const res = await request(ApiEnum.LOGIN_GOOGLE, {
        credential: credentialResponse.credential,
      });

      if (res.success) {
        const { accessToken, refreshToken, employeeId, role } = res.data;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: employeeId,
            role: role
          })
        );
        if (res.data.role === "EVM_STAFF") navigate("/dashboardevmstaff");
        else if (res.data.role === "SC_TECH") navigate("/overview");
        else navigate("/dashboard");
      } else {
        setError(res.message || "Google login failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed");
    }
  };

  return (
    <div className="login-container">
      {/* Nút chuyển sang Home */}
      <button className="home-button" onClick={() => navigate("/home")}>
        CustomerAppointment
      </button>
      <div className="login-content">
        <div className="login-header">
          {/* Consider using an SVG or local image */}
          {/* <img src="/logo.png" alt="Logo" className="login-logo" /> */}
          <svg
            className="login-logo"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" fill="#FFF" />
            <path
              d="M50 15L79.3 30V70L50 85L20.7 70V30L50 15Z"
              fill="#00509D"
            />
          </svg>
          <h1>OEM EV Management</h1>
          <p className="login-subtitle">
            Internal electric vehicle warranty system
          </p>
        </div>

        <div className="login-box">
          <h2>Login</h2>
          {error && (
            <div className="login-error">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  fill="currentColor"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Using the reusable Input component */}
            <Input
              type="text"
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              required
              fullWidth
              // className="login-input" /* Input component handles its own base styling */
            />

            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              // className="login-input"
            />

            {/* Using the reusable Button component */}
            <Button
              type="submit"
              variant="primary" // Use primary variant
              fullWidth
              className="login-button"
              isLoading={isLoading} // Pass loading state
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          {/* Google Login */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <p>or</p>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Google login failed")}
            />
          </div>
        </div>

        <div className="login-footer">
          © {new Date().getFullYear()} OEM EV • For internal staff only
        </div>
      </div>
    </div>
  );
};

export default Login;
