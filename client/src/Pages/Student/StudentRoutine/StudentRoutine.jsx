import React, { useEffect, useState } from "react";
import useAuth from "../../../Components/Hooks/useAuth";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const StudentRoutine = () => {
  const { user } = useAuth();
  const axiosSecure = AxiosSecure();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredMonth, setFilteredMonth] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [submittedAssignments, setSubmittedAssignments] = useState({});

  const years = [2024, 2025, 2026, 2027, 2028];
  const months = Array.from({ length: 12 }, (_, i) =>
    dayjs().month(i).format("MMMM")
  );

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      setFilteredMonth(`${selectedMonth} ${selectedYear}`);
    } else {
      setFilteredMonth("");
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchStudentRoutine = async () => {
      if (!user?.email || !filteredMonth) return;
      try {
        setLoading(true);
        const res = await axiosSecure.get(
          `/student/routine/${user.email}?monthYear=${encodeURIComponent(
            filteredMonth
          )}`
        );
        setRoutines(res.data);

        // Track which assignments the student already submitted
        const submissions = {};
        res.data.forEach((routine) => {
          routine.routines.forEach((day, idx) => {
            if (day.subAssignments) {
              const match = day.subAssignments.find(
                (s) => s.studentEmail === user.email
              );
              if (match) {
                submissions[`${routine._id}_${idx}`] = match;
              }
            }
          });
        });
        setSubmittedAssignments(submissions);
      } catch (err) {
        console.error("Failed to fetch student routine:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentRoutine();
  }, [user?.email, filteredMonth]);

  const handleSubmitAssignment = async (e, routineId, dayIndex) => {
    e.preventDefault();
    const form = e.target;
    const file = form.studentAssignment.files[0];

    if (!file) {
      return Swal.fire("Missing File", "Please choose a PDF file", "warning");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("routineId", routineId);
    formData.append("dayIndex", dayIndex);
    formData.append("email", user.email);
    formData.append("name", user.displayName || "Unknown Student");

    setUploadingIdx(`${routineId}_${dayIndex}`);
    try {
      const res = await axiosSecure.patch(
        "/upload-student-classAssignment",
        formData
      );
      if (res.data?.message) {
        Swal.fire("Submitted!", "Assignment uploaded successfully.", "success");
        form.reset();
        setSubmittedAssignments((prev) => ({
          ...prev,
          [`${routineId}_${dayIndex}`]: {
            fileUrl: res.data.fileUrl || "",
            studentEmail: user.email,
          },
        }));
      } else {
        Swal.fire("Failed!", "Failed to submit assignment.", "error");
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      Swal.fire("Error", "An error occurred during submission.", "error");
    } finally {
      setUploadingIdx(null);
    }
  };

  // console.log(routines)

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold text-center mb-6">
        📘️ My Weekly Class Routine
      </h1>

      <div className="flex justify-center gap-4 mb-6">
        <select
          className="border px-4 py-2 rounded-md shadow"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">Select Month</option>
          {months.map((month, i) => (
            <option key={i} value={month}>
              {month}
            </option>
          ))}
        </select>

        <select
          className="border px-4 py-2 rounded-md shadow"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
          {years.map((year, i) => (
            <option key={i} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {!filteredMonth ? (
        <p className="text-center text-gray-500">
          Please select a month and year to get the routine.
        </p>
      ) : loading ? (
        <p className="text-center">Loading...</p>
      ) : routines.length === 0 ? (
        <p className="text-center text-gray-500">
          No routine available for your department.
        </p>
      ) : (
        routines.map((routine, i) => (
          <div
            key={i}
            className="w-[95%] mx-auto border rounded-lg p-2 mb-6 shadow bg-white overflow-x-auto"
          >
            <div className="mb-4">
              <h3 className="font-bold text-lg">
                {routine.department} - {routine.semester}
              </h3>
              <p className="text-sm text-green-500">
                Week Start:{" "}
                {dayjs(routine.weekStartDate).format("MMMM D, YYYY")}
              </p>
            </div>

              <div className="w-full overflow-x-auto">
                <table className="md:min-w-[700px] w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="border p-2">Day</th>
                      <th className="border p-2">Course</th>
                      <th className="border p-2">Time</th>
                      <th className="border p-2">Online Link</th>
                      <th className="border p-2">Notes</th>
                      <th className="border p-2">Assignment</th>
                      <th className="border p-2">Submit Assignment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routine.routines.map((day, idx) => {
                      const isSubmitted =
                        submittedAssignments[`${routine._id}_${idx}`];
                      return (
                        <tr key={idx}>
                          <td className="border p-2 whitespace-nowrap">
                            {day.day}
                          </td>
                          <td className="border p-2 whitespace-nowrap">
                            {day.course || "N/A"}
                          </td>
                          <td className="border p-2 whitespace-nowrap">
                            {day.time}
                          </td>
                          <td className="border p-2 whitespace-nowrap">
                            <a
                              href={day.onlineLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              Join Class
                            </a>
                          </td>
                          <td className="border p-2 whitespace-nowrap">
                            {day.status === "completed" && day.notes?.url ? (
                              <a
                                href={day.notes.url}
                                download
                                className="text-green-600 underline font-semibold"
                              >
                                📄 Download Notes
                              </a>
                            ) : (
                              <span className="text-gray-500">No Notes</span>
                            )}
                          </td>
                          <td className="border p-2 whitespace-nowrap">
                            {day.status === "completed" &&
                            day.assignment?.url ? (
                              <a
                                href={day.assignment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-700 underline"
                              >
                                📌 View Assignment
                              </a>
                            ) : (
                              <span className="text-gray-500">
                                No Assignment
                              </span>
                            )}
                          </td>
                          <td className="border p-2 whitespace-nowrap">
                            {isSubmitted ? (
                              <a
                                href={isSubmitted.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 underline"
                              >
                                ✅ Submitted
                              </a>
                            ) : day.status === "completed" &&
                              day.assignment?.url ? (
                              <form
                                className="flex items-center gap-2"
                                onSubmit={(e) =>
                                  handleSubmitAssignment(e, routine._id, idx)
                                }
                              >
                                <input
                                  type="file"
                                  name="studentAssignment"
                                  accept=".pdf"
                                  className="file-input file-input-sm file-input-bordered"
                                  required
                                />
                                <button
                                  type="submit"
                                  disabled={
                                    uploadingIdx === `${routine._id}_${idx}`
                                  }
                                  className={`btn btn-xs text-white ${
                                    uploadingIdx === `${routine._id}_${idx}`
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-blue-500 hover:bg-blue-600"
                                  }`}
                                >
                                  {uploadingIdx === `${routine._id}_${idx}`
                                    ? "Submitting..."
                                    : "Submit"}
                                </button>
                              </form>
                            ) : (
                              <span className="text-gray-400 italic">
                                Not Available
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
          </div>
        ))
      )}
    </div>
  );
};

export default StudentRoutine;
