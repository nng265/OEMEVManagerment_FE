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

      if (res.success && res.data) {
        const { role, accessToken } = res.data;

        const userData = { username, role };
        setUser(userData);
        setToken(accessToken);

        // ✅ Lưu user + token vào localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", accessToken);

        return true;
      }

      return false;
    } catch (err) {
      console.error("Login error:", err);
      return false;
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
