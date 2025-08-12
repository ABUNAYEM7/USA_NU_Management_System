import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import useAuth from "../../../Components/Hooks/useAuth";
import { useNavigate } from "react-router";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const { user: admin } = useAuth();
  const axiosInstance = AxiosSecure();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(`/all-users?page=${page}&limit=${limit}`);
      const filtered = res.data?.users?.filter((u) => u.email !== admin?.email);
      setUsers(filtered || []);
      setTotalPages(Math.ceil((res.data?.total || 0) / limit));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    if (admin?.email) {
      fetchUsers();
    }
  }, [admin?.email, page]);

  const adminHandler = async (id) => {
    const res = await axiosInstance.patch(`/update/user-role/${id}`, {
      role: "admin",
    });
    if (
      (res?.data?.matchedCount > 0 && res?.data?.modifiedCount > 0) ||
      (res?.data?.matchedCount > 0 && res?.data?.modifiedCount === 0)
    ) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "User Role Updated Successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      fetchUsers();
    }
  };

  const studentHandler = async (id) => {
    navigate(`/dashboard/add-student/${id}`);
  };

  const deleteHandler = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await axiosInstance.delete(`/delete-user/${id}`);
        if (res?.data?.deletedCount > 0) {
          fetchUsers();
          Swal.fire({
            title: "Deleted!",
            text: "User has been deleted.",
            icon: "success",
          });
        }
      }
    });
  };

  return (
    <div className="px-4 md:px-10 py-6 min-h-screen bg-base-200">
      <h3 className="text-3xl font-black text-center mt-6">User Management</h3>

      <div className="mt-12 w-full overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="table table-zebra min-w-[900px]">
            <thead className="bg-base-300">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role Management</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user?._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img
                            referrerPolicy="no-referrer"
                            src={user?.photo}
                            alt="Avatar"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{user?.name}</div>
                        <div className="text-sm opacity-50">
                          <div className="badge badge-info text-white">
                            {user?.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>{user?.email}</td>

                  <td>
                    {user?.enrollRequest ? (
                      <button
                        onClick={() =>
                          navigate(`/dashboard/review-enrollReq/${user._id}`)
                        }
                        className="btn btn-sm bg-prime text-black"
                      >
                        Review
                      </button>
                    ) : (
                      <div className="dropdown dropdown-start">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-sm m-1"
                        >
                          Click ⬇️
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-100 rounded-box z-1 w-32 p-2 shadow-sm"
                        >
                          <li>
                            <button
                              onClick={() => adminHandler(user?._id)}
                              disabled={user?.role === "admin"}
                              className={
                                user?.role === "admin"
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            >
                              Admin
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => studentHandler(user?._id)}
                              disabled={
                                user?.role === "student" ||
                                user?.role === "faculty"
                              }
                              className={
                                user?.role === "student" ||
                                user?.role === "faculty"
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            >
                              Student
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </td>

                  <td>
                    <button
                      onClick={() => deleteHandler(user?._id)}
                      className="btn btn-sm btn-error text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Pagination buttons outside the table */}
      <div className="flex justify-center mt-6 gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`btn btn-sm ${
              page === i + 1 ? "btn-primary" : "btn-outline"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ManageUsers;
