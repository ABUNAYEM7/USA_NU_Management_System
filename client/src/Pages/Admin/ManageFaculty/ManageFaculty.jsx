import React from "react";
import useFetchData from "../../../Components/Hooks/useFetchData";
import Swal from "sweetalert2";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import { Link, useNavigate } from "react-router";

const ManageFaculty = () => {
  const axiosInstance = AxiosSecure();
  const { data, refetch } = useFetchData("faculties", "/all-faculties");
  const navigate = useNavigate()

  const faculties = data?.result;

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
        const res = await axiosInstance.delete(`/delete-faculty/${id}`);
        if (res?.data?.deletedCount > 0) {
          refetch();
          Swal.fire({
            title: "Deleted!",
            text: "Faculty has been deleted.",
            icon: "success",
          });
        }
      }
    });
  };

  const viewDetails=(email)=>{
    navigate(`/dashboard/view-details/${email}`)
  }

  return (
    <div className="px-4 md:px-10 py-6 min-h-screen bg-base-200">
      <h3 className="text-3xl font-black text-center mt-6">
        Faculties Management
      </h3>

      <div className="mt-3 p-4 flex items-center justify-end">
        <Link
          to={"/dashboard/add-faculty"}
          className="btn uppercase hover:bg-green-400 hover:text-white"
        >
          Add Faculty ➕
        </Link>
      </div>

      {faculties?.length === 0 ? (
        <h3 className="text-2xl font-semibold text-center text-red-600 mt-6">
          No Faculty Available
        </h3>
      ) : (
        <div className="mt-6 w-full overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="table table-zebra min-w-[900px]">
              <thead className="bg-base-300">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Staff No</th>
                  <th>Contact No</th>
                  <th>View Details</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {faculties?.map((faculty) => (
                  <tr key={faculty?._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            <img
                              referrerPolicy="no-referrer"
                              src={faculty?.staffPhoto}
                              alt="faculty avatar"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {faculty?.firstName}
                            <span className="ml-2">{faculty?.lastName}</span>
                          </div>
                          <div className="text-sm opacity-50">
                            <div className="badge badge-info text-white">
                              {faculty?.designation}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{faculty?.email}</td>
                    <td>{faculty?.staffNo}</td>
                    <td>{faculty?.mobile}</td>
                    <td>
                      {" "}
                      <button
                        onClick={() => viewDetails(faculty?.email)}
                        className="btn btn-sm bg-prime mr-2"
                      >
                        View Details
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => deleteHandler(faculty?._id)}
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
      )}
    </div>
  );
};

export default ManageFaculty;
