/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { request, ApiEnum } from "../services/NetworkUntil";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Khi app load lại, đọc user + token từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  // Hàm login
  const login = async (username, password) => {
    try {
      const res = await request(ApiEnum.LOGIN, { username, password });
      console.log("Login response:", res);

      if (res.success && res.data && res.data.accessToken) {
        // Đảm bảo response có đúng format
        const { role = 'user', accessToken } = res.data;
        
        const userData = { 
          username, 
          role,
          id: res.data.id || null
        };

        setUser(userData);
        setToken(accessToken);

        // Lưu user + token vào localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", accessToken);

        return {
          success: true,
          message: res.message || 'Login successful'
        };
      }

      return {
        success: false,
        message: res.message || 'Invalid credentials'
      };

    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message: err.message || 'An error occurred during login'
      };
    }
  };

  // Hàm logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
