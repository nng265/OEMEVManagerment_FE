import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/atoms/Button/Button";
import { Input } from "../components/atoms/Input/Input";
import { GoogleLogin } from "@react-oauth/google";
import { request, ApiEnum } from "../services/NetworkUntil";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

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
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loginResult = await login(formData.username, formData.password);
      if (loginResult && loginResult.success) {
        const userData = JSON.parse(localStorage.getItem("user"));

        if (userData && (userData.role === "EVM_STAFF" || userData.role === "ADMIN")) {
          navigate("/dashboardevmstaff");
        } else if (userData && userData.role === "SC_TECH") {
          navigate("/overview");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(loginResult?.message || "Invalid username or password.");
      }
    } catch (err) {
      console.error("Login page error:", err);
      setError(
        err?.message || "An error occurred during login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError("");

      const res = await request(ApiEnum.LOGIN_GOOGLE, {
        credential: credentialResponse.credential, // id_token từ Google
      });

      if (res.success) {
        const { accessToken, refreshToken, employeeId, role } = res.data;

        loginWithGoogle({ id: employeeId, role }, accessToken);

        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        if (role === "EVM_STAFF") navigate("/dashboardevmstaff");
        else if (role === "SC_TECH") navigate("/overview");
        else navigate("/dashboard");
      } else {
        setError(res.message || "Google login failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(err?.responseData?.message || "Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div className="login-container">
      <button className="home-button" onClick={() => navigate("/home")}>
        CustomerAppointment
      </button>

      <div className="login-content">
        <div className="login-header">
          <img src="../../public/logo.png" alt="Logo" className="login-logo" />
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
            <Input
              type="text"
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              required
              fullWidth
            />

            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="login-button"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="google-wrapper">
            <p>or</p>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="100%"
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
