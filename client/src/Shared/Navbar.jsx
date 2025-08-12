import React from "react";
import { Link, NavLink } from "react-router";
import logo from "../assets/logo.jpg";
import useAuth from "../Components/Hooks/useAuth";
import Swal from "sweetalert2";
import useUserRole from "../Components/Hooks/useUserRole";

const Navbar = () => {
  const { user, userLogOut } = useAuth();
  const { data: userRole } = useUserRole();

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
      localStorage.removeItem("hasSeen");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("❌ Logout error:", err);
      }
    }
  };

  const Links = (
<>
  <li>
    <NavLink
      to="/"
      className={({ isActive }) =>
        isActive ? "text-highlight underline font-semibold" : "text-black"
      }
    >
      Home
    </NavLink>
  </li>
  <li>
    <NavLink
      to="/aboutPage"
      className={({ isActive }) =>
        isActive ? "text-highlight underline font-semibold" : "text-black"
      }
    >
      About
    </NavLink>
  </li>
  <li>
    <NavLink
      to="/academic"
      className={({ isActive }) =>
        isActive ? "text-highlight underline font-semibold" : "text-black"
      }
    >
      Academic
    </NavLink>
  </li>
</>

  );

  return (
    <div className="navbar bg-green-200/60 backdrop-blur-md shadow-sm fixed top-0 z-50 mx-auto max-w-[1480px]">
      {/* Left: Logo & Mobile Menu */}
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 text-highlight">
            {Links}
          </ul>
        </div>
        <Link to={"/"}>
          <img className="w-[70px] h-[70px] rounded-full" src={logo} alt="logo" />
        </Link>
      </div>

      {/* Center: Desktop Menu */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 text-xl font-medium text-black">
          {Links}
        </ul>
      </div>

      {/* Right: User Avatar / Auth */}
      <div className="navbar-end gap-3">
        {user ? (
          <div className="dropdown dropdown-bottom">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  referrerPolicy="no-referrer"
                  alt="User"
                  src={user?.photoURL || "/default-avatar.png"}
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu right-4 menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-0 w-52 p-2 shadow"
            >
              <li>
                {userRole?.data?.role !== "user" && (
                  <Link to="/dashboard" className="hover:text-highlight">
                    Dashboard
                  </Link>
                )}
                <button
                  className="hover:text-highlight mt-2"
                  onClick={logoutHandler}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <NavLink
            to="/signIn"
            className="btn bg-highlight text-white hover:bg-white hover:border-2 hover:border-highlight hover:text-highlight"
          >
            Sign In
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Navbar;
