import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import {
  FaBars,
  FaChartBar,
  FaHome,
  FaBook,
  FaUserGraduate,
  FaUsers,
  FaUserTie,
  FaClipboardList,
  FaMoneyBill,
} from "react-icons/fa";
import { BiCalendar } from "react-icons/bi";
import { MdMessage } from "react-icons/md";
import Swal from "sweetalert2";
import useAuth from "../Components/Hooks/useAuth";
import useUserRole from "../Components/Hooks/useUserRole";
import logo from "../assets/logo.jpg";
import FacultyRoutine from "../Pages/Faculty/FacultyRoutine/FacultyRoutine";
import { FaBell } from "react-icons/fa";
import { useNotification } from "../Components/Hooks/NotificationProvider/NotificationProvider";
import useMarkNotificationsSeen from "../Components/Hooks/NotificationProvider/useMarkNotificationsSeen";
import useRoleBasedNotifications from "../Components/Hooks/NotificationProvider/useRoleBasedNotifications";

const navIcons = {
  "ADMIN Dashboard": <FaHome />,
  Courses: <FaBook />,
  "Add Courses": <FaClipboardList />,
  Students: <FaUserGraduate />,
  Routine: <BiCalendar />,
  Faculty: <FaUserTie />,
  "Manage Users": <FaUsers />,
  Dashboard: <FaHome />,
  Grades: <FaClipboardList />,
  FacultyRoutine: <FacultyRoutine />,
  Attendance: <FaClipboardList />,
  Assignment: <FaClipboardList />,
  Materials: <FaBook />,
  Assignments: <FaClipboardList />,
  Fees: <FaMoneyBill />,
  Message: <MdMessage />,
};

const getNavClass = ({ isActive }) =>
  isActive
    ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary rounded-md px-3 py-2"
    : "text-gray-700 hover:bg-gray-100 rounded-md px-3 py-2";

const ResponsiveNavLink = ({ to, label, icon, end = false }) => (
  <NavLink to={to} className={getNavClass} end={end}>
    <div className="flex sm:flex-col items-center sm:items-start gap-2">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  </NavLink>
);

const DashboardDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userLogOut } = useAuth();
  const { data } = useUserRole();
  const userRole = data?.data?.role;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDrawer = () => setIsOpen(!isOpen);

  const { notifications, setNotifications } = useNotification();
  const markSeen = useMarkNotificationsSeen();
  const sidebarRef = useRef(null);

  const email = user?.email;

  const { data: fetchedNotifications = [] } = useRoleBasedNotifications(
    email,
    userRole
  );

  useEffect(() => {
    if (fetchedNotifications.length) {
      const sorted = [...fetchedNotifications].sort(
        (a, b) =>
          new Date(b.applicationDate || b.time) -
          new Date(a.applicationDate || a.time)
      );
      setNotifications(sorted);
    }
  }, [fetchedNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const logoutHandler = async () => {
    try {
      await userLogOut();
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Logout Successful",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async () => {
    setDropdownOpen((prev) => !prev);
    const unseenNotifications = notifications.filter((n) => !n.seen);
    if (unseenNotifications.length > 0) {
      await markSeen(unseenNotifications, "/faculty-notifications/mark-seen");
      const updated = notifications.map((n) =>
        unseenNotifications.find((u) => u._id === n._id)
          ? { ...n, seen: true }
          : n
      );
      setNotifications(updated);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="navbar bg-base-300 flex flex-wrap items-center justify-between px-4 fixed top-0 left-0 w-full z-50 min-w-0">
        <div className="space-x-2 flex items-center">
          <button onClick={toggleDrawer}>
            {isOpen ? <FaBars size={25} /> : <FaChartBar size={25} />}
          </button>
          <Link to={"/"}>
            <img className="w-20 h-20 rounded-full" src={logo} alt="logo" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {/* 🔔 Notification Bell */}
          <div className="relative dropdown-end">
            <button
              onClick={handleNotificationClick}
              className="btn btn-ghost btn-circle relative"
            >
              <FaBell className="text-xl" />
              {notifications.some((n) => !n.seen) && (
                <span className="badge badge-sm bg-red-600 text-white absolute -top-1 -right-1">
                  {notifications.filter((n) => !n.seen).length}
                </span>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 z-[1] card card-compact w-80 bg-white shadow-lg">
                <div className="card-body">
                  <h3 className="font-bold text-lg">Notifications</h3>
                  <ul className="divide-y max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="py-2 text-gray-500">No notifications</li>
                    ) : (
                      [...notifications]
                        .sort(
                          (a, b) =>
                            new Date(b.applicationDate || b.time) -
                            new Date(a.applicationDate || a.time)
                        )
                        .map((n, i) => (
                          <li
                            key={n._id || i}
                            className="py-2 text-sm space-y-1"
                          >
                            {/* 🔵 Faculty View */}
                            {userRole === "faculty" && (
                              <>
                                {n.type === "leave-request" && (
                                  <>
                                    <strong>📝 Leave Request</strong>
                                    <div className="text-xs">
                                      From: {n.email}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {n.reason}
                                    </div>
                                  </>
                                )}
                                {n.type === "course-assigned" && (
                                  <>
                                    <strong>📘 New Course Assigned</strong>
                                    <div className="text-xs">
                                      Course: {n.courseName}
                                    </div>
                                  </>
                                )}
                                {n.type === "student-enrolled" && (
                                  <>
                                    <strong>👨‍🎓 New Student Enrolled</strong>
                                    <div className="text-xs">
                                      {n.email} → {n.courseName}
                                    </div>
                                  </>
                                )}
                              </>
                            )}

                            {/* 🎓 Student View */}
                            {userRole === "student" && (
                              <>
                                {n.type === "assignment" && (
                                  <>
                                    <strong>📚 New Assignment</strong>
                                    <div className="text-xs">
                                      Course: {n.courseName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Title: {n.title}
                                    </div>
                                  </>
                                )}
                                {n.type === "grade" && (
                                  <>
                                    <strong>📊 Grade Released</strong>
                                    <div className="text-xs">
                                      {n.courseName} → {n.point} /{" "}
                                      {n.outOf || 4}
                                    </div>
                                  </>
                                )}
                                {n.type === "fee-updated" && (
                                  <>
                                    <strong>💰 Fee Updated</strong>
                                    <div className="text-xs">
                                      Course: {n.courseName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {n.message}
                                    </div>
                                  </>
                                )}
                              </>
                            )}

                            {/* 🧑‍💼 Admin View */}
                            {userRole === "admin" && (
                              <>
                                {/* 💳 Payment Notification */}
                                {n.type === "payment" && (
                                  <>
                                    <strong>💳 Payment Received</strong>
                                    <div className="text-xs">
                                      From:{" "}
                                      {n.email || n.userEmail || "Unknown"}
                                    </div>
                                    <div className="text-xs">
                                      Amount:{" "}
                                      {n.message?.match(/\$[\d.]+/)?.[0] ||
                                        `$${n.amount || "N/A"}`}
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                      Txn: {n.transactionId || "N/A"}
                                    </div>
                                  </>
                                )}

                                {/* 📥 Enrollment Request Notification */}
                                {n.type === "enrollment-request" && (
                                  <>
                                    <strong>📥 Enrollment Request</strong>
                                    <div className="text-xs">
                                      {n.message ||
                                        `${
                                          n.studentName || "Unknown"
                                        } has requested enrollment.`}
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                      Student: {n.studentName || "N/A"} (
                                      {n.studentEmail || "N/A"})
                                    </div>
                                  </>
                                )}

                                {/* 🧩 Fallback for unknown notification types */}
                                {!["payment", "enrollment-request"].includes(
                                  n.type
                                ) && (
                                  <>
                                    <strong>🔔 Notification</strong>
                                    <div className="text-xs text-gray-500">
                                      Type: {n.type || "unknown"}
                                    </div>
                                    <div className="text-xs">
                                      {n.message ||
                                        "No additional information."}
                                    </div>
                                  </>
                                )}
                              </>
                            )}

                            {/* 🕒 Date */}
                            <div className="text-[10px] text-gray-400">
                              {new Date(
                                n.applicationDate || n.time
                              ).toLocaleString()}
                            </div>
                          </li>
                        ))
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="dropdown dropdown-bottom">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  referrerPolicy="no-referrer"
                  alt="user"
                  src={user?.photoURL || "/default-avatar.png"}
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content right-0 bg-base-100 rounded-box shadow mt-2 w-52 p-2 z-50"
            >
              <li>
                <Link to="/dashboard/profile" className="hover:text-primary">
                  Profile
                </Link>
              </li>
              <li>
                <button onClick={logoutHandler} className="hover:text-primary">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sidebar and Page Content */}
      <div className="flex flex-col sm:flex-row flex-1 mt-20">
        <div
          ref={sidebarRef}
          className={`transition-all duration-300 ${
            isOpen ? "w-64" : "w-0"
          } bg-base-200 fixed top-16 sm:top-16 left-0 h-[calc(100vh-4rem)] z-40 overflow-y-auto`}
        >
          <div className="p-4 mt-4">
            <ul className="menu w-full text-lg font-semibold space-y-2">
              {userRole === "admin" && (
                <>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/admin/home"
                      label="ADMIN Dashboard"
                      icon={navIcons["ADMIN Dashboard"]}
                      end
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/courses"
                      label="Courses"
                      icon={navIcons.Courses}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/routine"
                      label="Routine"
                      icon={navIcons.Routine}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/manage-students"
                      label="Students"
                      icon={navIcons.Students}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/manage-faculty"
                      label="Faculty"
                      icon={navIcons.Faculty}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/manage-users"
                      label="Manage Users"
                      icon={navIcons["Manage Users"]}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/message"
                      label="Message"
                      icon={navIcons.Message}
                    />
                  </li>
                </>
              )}
              {userRole === "faculty" && (
                <>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/faculty/home"
                      label="Dashboard"
                      icon={navIcons.Dashboard}
                      end
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/faculty-courses"
                      label="Courses"
                      icon={navIcons.Courses}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/faculty-routine"
                      label="Routine"
                      icon={navIcons.Routine}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/faculty-grades"
                      label="Grades"
                      icon={navIcons.Grades}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/faculty-attendance"
                      label="Attendance"
                      icon={navIcons.Attendance}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/assignment"
                      label="Assignment"
                      icon={navIcons.Assignment}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/materials"
                      label="Materials"
                      icon={navIcons.Materials}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/message"
                      label="Message"
                      icon={navIcons.Message}
                    />
                  </li>
                </>
              )}
              {userRole === "student" && (
                <>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/student/home"
                      label="Dashboard"
                      icon={navIcons.Dashboard}
                      end
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/student-courses"
                      label="Courses"
                      icon={navIcons.Courses}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/student-assignment"
                      label="Assignments"
                      icon={navIcons.Assignments}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/student-routine"
                      label="Routine"
                      icon={navIcons.Routine}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/attendance"
                      label="Attendance"
                      icon={navIcons.Attendance}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/grade"
                      label="Grades"
                      icon={navIcons.Grades}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/fee"
                      label="Fees"
                      icon={navIcons.Fees}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/studentMaterials"
                      label="Materials"
                      icon={navIcons.Materials}
                    />
                  </li>
                  <li>
                    <ResponsiveNavLink
                      to="/dashboard/message"
                      label="Message"
                      icon={navIcons.Message}
                    />
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="p-2 flex-1 bg-base-100 mt-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardDrawer;
