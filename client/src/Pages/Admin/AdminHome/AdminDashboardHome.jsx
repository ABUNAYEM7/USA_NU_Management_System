import React from "react";
import useAuth from "../../../Components/Hooks/useAuth";
import useFetchData from "../../../Components/Hooks/useFetchData";
import {
  FaUserShield,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUsers,
} from "react-icons/fa";

const AdminDashboardHome = () => {
  const { user } = useAuth();
  const { data: state } = useFetchData("state", "/user-state");

  const dashboardItems = [
    {
      title: "Total Admins",
      count: state?.totalAdmin,
      icon: <FaUserShield size={30} />,
      color: "bg-blue-500",
    },
    {
      title: "Total Students",
      count: state?.totalStudents,
      icon: <FaUserGraduate size={30} />,
      color: "bg-green-500",
    },
    {
      title: "Total Faculties",
      count: state?.totalFaculty,
      icon: <FaChalkboardTeacher size={30} />,
      color: "bg-yellow-500",
    },
    {
      title: "Total Users",
      count: state?.totalUser,
      icon: <FaUsers size={30} />,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="p-3 md:p-6 bg-gray-100 min-h-screen z-0 mt-6">
      <h1 className="text-xl md:text-4xl font-bold text-[#243c5a] mb-8">
        Welcome Dear {user?.displayName}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardItems.map((item, index) => (
          <div
            key={index}
            className={`card ${item.color} text-white shadow-xl`}
          >
            <div className="card-body flex-row items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold">{item.count}</h2>
                <p className="font-medium">{item.title}</p>
              </div>
              <div>{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Activities Table */}
      <h2 className="card-title">Upcoming Activities</h2>
      <div className="overflow-x-auto w-full mt-4 ">
        <table className="table table-zebra  w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Activity</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-sm md:text-base">
              <td>1</td>
              <td>User Role Review</td>
              <td>April 12, 2025</td>
              <td>
                <span className="badge badge-warning text-[10px] md:text-base">
                  Scheduled
                </span>
              </td>
            </tr>
            <tr className="text-sm md:text-base">
              <td>2</td>
              <td>System Backup & Maintenance</td>
              <td>April 14, 2025</td>
              <td>
                <span className="badge badge-info text-[10px] md:text-base">
                  In Progress
                </span>
              </td>
            </tr>
            <tr className="text-sm md:text-base">
              <td>3</td>
              <td>Faculty Feedback Review</td>
              <td>April 17, 2025</td>
              <td>
                <span className="badge badge-success text-[10px] md:text-base">
                  Pending
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
