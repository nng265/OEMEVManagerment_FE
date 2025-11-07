import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (user.role === "EVM_STAFF") {
    return <Navigate to="/dashboardevmstaff" replace />;
  }

  if (user.role === "SC_STAFF") {
    return <Navigate to="/dashboard" replace />;
  }
//   return <Navigate to="/dashboard" replace />;
};
