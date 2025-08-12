import React from "react";
import useAuth from "../../Components/Hooks/useAuth";
import CustomLoader from "../../utility/CustomLoader";
import { Navigate } from "react-router";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <CustomLoader />;
  }

  if (!user) {
    return <Navigate to={"/signIn"} />;
  }

  return children;
};

export default PrivateRoute;
