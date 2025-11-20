import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // chuyen huong dua tren vai tro nguoi dung
  if (user.role === "EVM_STAFF") {
    return <Navigate to="/dashboardevmstaff" replace />;
  }

  if (user.role === "SC_STAFF") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user.role === "SC_TECH") {
    return <Navigate to="/overview" replace />;
  }
};
