import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import useFetchData from "../../../Components/Hooks/useFetchData";
import useAuth from "../../../Components/Hooks/useAuth";
import Swal from "sweetalert2";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";

const Assignment = () => {
  const { user } = useAuth();
  const axiosInstance = AxiosSecure();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, refetch } = useFetchData(
    `${user?.email}`,
    `/assignments/${user?.email}?page=${page}&limit=${limit}`
  );
  const navigate = useNavigate();

  // ✅ Refetch when page or limit changes
  useEffect(() => {
    refetch();
  }, [page, limit, refetch]);

  // deleteHandler
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
        const res = await axiosInstance.delete(`/delete-assignment/${id}`);
        if (res?.data?.deletedCount > 0) {
          refetch();
          Swal.fire({
            title: "Deleted!",
            text: "Assignment has been deleted.",
            icon: "success",
          });
        }
      }
    });
  };

  // detailsHandler
  const detailsHandler = (id) => {
    navigate(`/dashboard/assignment-details/${id}`);
  };

  return (
    <div>
      <div className="mt-3 p-2 md:p-4 flex items-center justify-between">
        <h3 className="text-lg md:text-2xl font-medium">
          Assignment Management
        </h3>
        <Link
          to={"/dashboard/add-assignment"}
          className="btn btn-sm md:btn-md uppercase hover:bg-green-400 hover:text-white"
        >
          Add Assignment ➕
        </Link>
      </div>
      <div className="mt-12 overflow-x-auto sm:max-w-full max-w-[90vw] border rounded shadow bg-white">
        <table className="table w-full min-w-[600px]">
          <thead className="bg-gray-100">
            <tr>
              <th>#</th>
              <th>Course ID</th>
              <th>Title</th>
              <th>File</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data?.assignments?.length > 0 ? (
              data?.assignments?.map((assignment, i) => (
                <tr key={assignment._id}>
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td>{assignment.courseId}</td>
                  <td>{assignment.title}</td>
                  <td>
                    <button
                      className="text-blue-600 underline cursor-pointer"
                      onClick={() => detailsHandler(assignment._id)}
                    >
                      View Details
                    </button>
                  </td>
                  <td>
                    <Link
                      to={`/dashboard/add-assignment/${assignment._id}`}
                      className="btn btn-sm bg-green-500 text-white"
                    >
                      Edit
                    </Link>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteHandler(assignment._id)}
                      className="btn btn-sm bg-red-500 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 text-red-500 ">
                  No assignment uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data?.total > limit && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            className="btn btn-sm"
            onClick={() => {
              if (page > 1) setPage(page - 1);
            }}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-sm font-medium">
            Page {page} of {Math.ceil(data?.total / limit)}
          </span>
          <button
            className="btn btn-sm"
            onClick={() => {
              if (page < Math.ceil(data?.total / limit)) setPage(page + 1);
            }}
            disabled={page >= Math.ceil(data?.total / limit)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Assignment;
