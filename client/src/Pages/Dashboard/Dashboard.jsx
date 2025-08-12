import React from "react";
import { Outlet, Navigate, useLocation } from "react-router";
import useUserRole from "../../Components/Hooks/useUserRole";
import useAuth from "../../Components/Hooks/useAuth";
import CustomLoader from "../../utility/CustomLoader";
import DashboardDrawer from "../../Shared/DashboardDrawer";

const Dashboard = () => {
  const { loading } = useAuth();
  const { data,isLoading } = useUserRole();
  const location = useLocation();

  const user = data?.data;

  // Show loader while loading
  if (loading || isLoading) {
    return <CustomLoader />;
  }

  // If role is admin
  if (user?.role === "admin") {
    // Redirect "/dashboard" to "/dashboard/home" if not already
    if (location.pathname === "/dashboard") {
      return <Navigate to="/dashboard/admin/home" replace />;
    }
    return (
      <DashboardDrawer>
        <Outlet />
      </DashboardDrawer>
    );
  }

  // If role is student
  if (user?.role === "student") {
    if (location.pathname === "/dashboard") {
      return <Navigate to="/dashboard/student/home" replace />;
    }
    return (
      <DashboardDrawer>
        <Outlet />
      </DashboardDrawer>
    );
  }
  // If role is faculty
  if (user?.role === "faculty") {
    if (location.pathname === "/dashboard") {
      return <Navigate to="/dashboard/faculty/home" replace />;
    }
    return (
       <DashboardDrawer>
        <Outlet />
      </DashboardDrawer>
    );
  }

  // If user is neither admin nor student (or null)L
  return <Navigate to="/" replace />;
};

export default Dashboard;
