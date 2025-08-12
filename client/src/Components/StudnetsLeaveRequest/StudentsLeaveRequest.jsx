import React from "react";
import useFetchData from "../Hooks/useFetchData";
import useUserRole from "../Hooks/useUserRole";
import useAuth from "../Hooks/useAuth";
import Swal from "sweetalert2";
import AxiosSecure from "../Hooks/AxiosSecure";

const StudentsLeaveRequest = () => {
  const { user } = useAuth();
  const { data: leaveReq,refetch } = useFetchData(
    `${user?.email}`,
    `/student-leave/request/${user?.email}`
  );
  const axiosInstance = AxiosSecure()

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
        const res = await axiosInstance.delete(`/delete-leaveReq/${id}`);
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">My Leave Requests</h2>

      {!Array.isArray(leaveReq) || leaveReq.length === 0 ? (
        <p className="text-center text-gray-500">No leave requests submitted yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leaveReq.map((leave, index) => {
            const statusColor =
              leave.status === "approved"
                ? "border-l-4 border-prime bg-prime/10 text-green-800"
                : leave.status === "declined"
                ? "border-l-4 border-highlight bg-highlight/10 text-red-700"
                : "border-l-4 border-yellow-500 bg-yellow-50 text-yellow-700";

            return (
              <div
                key={index}
                className={`rounded-xl shadow p-4 space-y-2 ${statusColor}`}
              >
                <p><strong>Leave Type:</strong> {leave.leaveType}</p>
                <p><strong>Reason:</strong> {leave.reason || "N/A"}</p>
                <p><strong>Start Date:</strong> {leave.startDate}</p>
                <p><strong>End Date:</strong> {leave.endDate}</p>
                <p><strong>Application Date:</strong> {leave.applicationDate?.split("T")[0]}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="capitalize font-semibold">
                    {leave.status || "pending"}
                  </span>
                </p>
                <div>
                  <button 
                  onClick={()=>deleteHandler(leave._id)}
                  className="btn border-2 border-black">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentsLeaveRequest;
