import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import dayjs from "dayjs";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import Swal from "sweetalert2";

const Routine = () => {
  const [routines, setRoutines] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const axiosInstance = AxiosSecure();
  const navigate = useNavigate();

  const yearOptions = [2025,2026,2027]; // Customize your year options here
  const monthOptions = Array.from({ length: 12 }, (_, i) =>
    dayjs().month(i).format("MMMM")
  );

  const fetchRoutines = () => {
    if (selectedMonth && selectedYear) {
      const monthYear = `${selectedMonth} ${selectedYear}`;
      axiosInstance
        .get(`/all/weekly-routines?monthYear=${monthYear}`)
        .then((res) => setRoutines(res.data))
        .catch((err) => console.error("Error loading routines", err));
    } else {
      setRoutines([]);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [selectedMonth, selectedYear]);

  const handleEdit = (routineItem, dayItem, index) => {
    navigate(`/dashboard/edit-routine/${routineItem._id}/${index}`);
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
        try {
          const res = await axiosInstance.delete(
            `/delete/weekly-routine/${id}`
          );
          if (res?.data?.deletedCount > 0) {
            Swal.fire("Deleted!", "Routine has been deleted.", "success");
            fetchRoutines();
          }
        } catch (err) {
          console.error("Delete error:", err);
        }
      }
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-4">
        📘 Quarter Class Routine
      </h1>

      <div className="flex justify-center gap-4 mb-6">
        <select
          className="select border-2 border-prime focus:outline-none"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">Select Month</option>
          {monthOptions.map((month, idx) => (
            <option key={idx} value={month}>
              {month}
            </option>
          ))}
        </select>

        <select
          className="select border-2 border-prime focus:outline-none"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
          {yearOptions.map((year, idx) => (
            <option key={idx} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end items-center mb-4">
        <Link
          to="/dashboard/add-routine"
          className="btn bg-green-500 text-white hover:bg-green-600"
        >
          Add Routine ➕
        </Link>
      </div>

      {routines.length > 0 ? (
        routines.map((routineItem, routineIndex) => (
          <div key={routineIndex} className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">
                  Department: {routineItem?.department}
                </h2>
                <h2 className="text-xl font-semibold text-green-600">
                  Week Start: {routineItem?.weekStartDate}
                </h2>
              </div>
              <button
                className="btn btn-sm bg-highlight text-white"
                onClick={() => deleteHandler(routineItem._id)}
              >
                Delete Entire Routine
              </button>
            </div>
            <div className="overflow-x-auto w-full flex justify-center">
              <table className="w-[95%] table table-zebra bg-base-100 rounded-lg shadow-md">
                <thead className="bg-base-200 text-base font-semibold">
                  <tr>
                    <th>#</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Course</th>
                    <th>Created At</th>
                    <th>Created By</th>
                    <th>Online Link</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {routineItem.routines.map((item, index) => (
                    <tr key={index} className="hover">
                      <td>{index + 1}</td>
                      <td>{item?.day}</td>
                      <td>{item?.time}</td>
                      <td>{item?.course || "N/A"}</td>
                      <td>
                        {dayjs(routineItem.createdAt).format("DD MMM YYYY")}
                      </td>
                      <td className="break-words max-w-[120px]">
                        {routineItem.createdBy}
                      </td>
                      <td className="text-blue-600 underline">
                        {item?.onlineLink ? (
                          <a
                            href={item.onlineLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Link
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item?.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item?.status || "pending"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-xs bg-prime text-black"
                          onClick={() => handleEdit(routineItem, item, index)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        selectedMonth &&
        selectedYear && (
          <p className="text-center text-gray-500 mt-4">
            No routine found for {selectedMonth} {selectedYear}.
          </p>
        )
      )}
    </div>
  );
};

export default Routine;
