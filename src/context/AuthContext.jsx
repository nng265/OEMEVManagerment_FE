import { createContext, useContext, useState, useEffect } from "react";
import { request, ApiEnum } from "../services/NetworkUntil";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // khi app load lai, doc user + token tu localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = async (username, password) => {
    try {
      localStorage.removeItem("token");

      const res = await request(ApiEnum.LOGIN, { username, password });
      console.log("Login response:", res);

      if (res.success && res.data && res.data.accessToken) {
        const { role = "user", accessToken, name, fullName } = res.data;

        const userData = {
          username,
          role,
          id: res.data.id || null,
          name: name || fullName || username,
        };

        setUser(userData);
        setToken(accessToken);

        //luu user + token vào localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", accessToken);

        return {
          success: true,
          message: res.message || "Login successful",
        };
      }

      return {
        success: false,
        message: res.message || "Invalid credentials",
      };
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message: err.message || "An error occurred during login",
      };
    }
  };

  const loginWithGoogle = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", accessToken);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    if (window.google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }
    
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
