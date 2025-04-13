import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { auth } = useContext(AuthContext);

  if (!auth.token) return <Navigate to="/login" />;
  if (!allowedRoles.includes(auth.role)) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
