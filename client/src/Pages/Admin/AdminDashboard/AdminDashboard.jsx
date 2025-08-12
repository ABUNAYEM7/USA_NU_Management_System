import React from "react";
import { LuSquareMenu } from "react-icons/lu";
import { NavLink, Outlet } from "react-router";

const AdminDashboard = () => {
  return (
    <div >
      <div className="w-fit drawer z-50">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* Page content here */}
          <label htmlFor="my-drawer" className="btn m-3 text-highlight fixed">
            <LuSquareMenu size={25} />
          </label>
        </div>
        <div className="drawer-side ">
          <label
            htmlFor="my-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu bg-accent text-white min-h-full w-[40%] md:w-[20%] p-4 space-y-3">
            {/* Sidebar content here */}
            <li>
              <NavLink
                to={"/dashboard"}
                className={({ isActive }) =>
                  `${isActive ? " border-2 border-white " : ""} text-white`
                }
                end
              >
                ADMIN Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  `${isActive ? " border-2 border-white" : ""}`
                }
                to={"/dashboard/courses"}
              >
                Courses
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  `${isActive ? " border-2 border-white" : ""}`
                }
                to={"/dashboard/add-courses"}
              >
                Add Courses
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  `${isActive ? " border-2 border-white" : ""}`
                }
                to={"/dashboard/manage-students"}
              >
                 Students
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  `${
                    isActive
                      ? " border-2 border-white text-white"
                      : "text-white"
                  }`
                }
                to={"/dashboard/manage-faculty"}
              >
                 Faculty
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  `${
                    isActive
                      ? " border-2 border-white text-white"
                      : "text-white"
                  }`
                }
                to={"/dashboard/manage-users"}
              >
                 Manage Users
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
