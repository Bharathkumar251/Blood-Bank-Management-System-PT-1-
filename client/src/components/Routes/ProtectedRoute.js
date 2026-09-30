import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "../../redux/features/auth/authActions";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();

  // Fetch the current logged-in user once on mount
  // Fixed: added [] dependency array — was missing, causing infinite API call loop
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  if (localStorage.getItem("token")) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
