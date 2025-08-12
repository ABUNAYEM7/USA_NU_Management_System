import React, { useState, useMemo, useEffect, useRef } from "react";
import useAuth from "../../../Components/Hooks/useAuth";
import dayjs from "dayjs";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import Swal from "sweetalert2";

const FacultyRoutine = () => {
  const { user } = useAuth();
  const email = user?.email;
  const axiosInstance = AxiosSecure();

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredMonth, setFilteredMonth] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const fileInputRefs = useRef({});
  const assignmentInputRefs = useRef({});
  const [editStates, setEditStates] = useState({});
  const [editAssignmentStates, setEditAssignmentStates] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [uploadingNotes, setUploadingNotes] = useState({});
  const [uploadingAssignments, setUploadingAssignments] = useState({});

  const years = [2025, 2026, 2027];

  const months = Array.from({ length: 12 }, (_, i) =>
    dayjs().month(i).format("MMMM")
  );

  const toggleRow = (key) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      setFilteredMonth(`${selectedMonth} ${selectedYear}`);
    } else {
      setFilteredMonth("");
    }
  }, [selectedMonth, selectedYear]);

  const fetchRoutines = async () => {
    if (!email || !filteredMonth) return;

    setLoading(true);
    try {
      const url = `/get-weekly/routine/${email}?monthYear=${encodeURIComponent(
        filteredMonth
      )}`;
      const res = await axiosInstance.get(url);
      setRoutines(res.data);
    } catch (err) {
      console.error("Failed to fetch routines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [email, filteredMonth]);

  const handleStatusUpdate = async (routineId, dayIndex, newStatus) => {
    try {
      const res = await axiosInstance.patch(
        `/update-routine-day-status/${routineId}/${dayIndex}`,
        { status: newStatus }
      );
      if (res.data?.modifiedCount > 0) {
        fetchRoutines();
      }
    } catch (error) {
      console.error("Error updating routine status:", error);
    }
  };

  const handleNotesUpload = async (e, routineId, dayIndex, course, day) => {
    e.preventDefault();
    const inputKey = `${routineId}_${dayIndex}`;
    setUploadingNotes((prev) => ({ ...prev, [inputKey]: true }));

    const file = fileInputRefs.current[inputKey]?.files[0];
    if (!file) {
      Swal.fire("No file selected", "Please choose a PDF file.", "warning");
      setUploadingNotes((prev) => ({ ...prev, [inputKey]: false }));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("routineId", routineId);
    formData.append("dayIndex", dayIndex);
    formData.append("course", course || "");
    formData.append("title", `Notes for ${day}`);
    formData.append("email", email);

    try {
      const res = await axiosInstance.patch("/upload-routine-note", formData);
      if (res.data?.message) {
        Swal.fire("Success", "📄 Notes uploaded successfully!", "success");
        fileInputRefs.current[inputKey].value = "";
        setEditStates((prev) => ({ ...prev, [inputKey]: false }));
        await fetchRoutines();
      } else {
        Swal.fire("Warning", "No changes made", "info");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      Swal.fire("Error", "❌ Upload failed", "error");
    } finally {
      setUploadingNotes((prev) => ({ ...prev, [inputKey]: false }));
    }
  };

  const handleAssignmentUpload = async (
    e,
    routineId,
    dayIndex,
    course,
    day
  ) => {
    e.preventDefault();
    const inputKey = `${routineId}_${dayIndex}`;
    setUploadingAssignments((prev) => ({ ...prev, [inputKey]: true }));

    const file = assignmentInputRefs.current[inputKey]?.files[0];
    if (!file) {
      Swal.fire("No file selected", "Please choose a PDF file.", "warning");
      setUploadingAssignments((prev) => ({ ...prev, [inputKey]: false }));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("routineId", routineId);
    formData.append("dayIndex", dayIndex);
    formData.append("course", course || "");
    formData.append("title", `Class Assignment for ${day}`);
    formData.append("email", email);

    try {
      const res = await axiosInstance.patch(
        "/routine/upload-assignment",
        formData
      );
      if (res.data?.message) {
        Swal.fire("Success", "📌 Assignment uploaded successfully!", "success");
        assignmentInputRefs.current[inputKey].value = "";
        setEditAssignmentStates((prev) => ({ ...prev, [inputKey]: false }));
        await fetchRoutines();
      } else {
        Swal.fire("Warning", "No changes made", "info");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      Swal.fire("Error", "❌ Assignment upload failed", "error");
    } finally {
      setUploadingAssignments((prev) => ({ ...prev, [inputKey]: false }));
    }
  };

  const handleAssignmentEditUpload = async (
  e,
  routineId,
  dayIndex,
  course,
  day
) => {
  e.preventDefault();
  const inputKey = `${routineId}_${dayIndex}`;
  setUploadingAssignments((prev) => ({ ...prev, [inputKey]: true }));

  const file = assignmentInputRefs.current[inputKey]?.files[0];
  if (!file) {
    Swal.fire("No file selected", "Please choose a PDF file.", "warning");
    setUploadingAssignments((prev) => ({ ...prev, [inputKey]: false }));
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("routineId", routineId);
  formData.append("dayIndex", dayIndex);
  formData.append("course", course || "");
  formData.append("title", `Class Assignment for ${day}`);
  formData.append("email", email);

  try {
    const res = await axiosInstance.patch(
      "/routine/edit-assignment", // ✅ new backend route
      formData
    );
    if (res.data?.message) {
      Swal.fire("Updated", "📌 Assignment updated successfully!", "success");
      assignmentInputRefs.current[inputKey].value = "";
      setEditAssignmentStates((prev) => ({ ...prev, [inputKey]: false }));
      await fetchRoutines();
    } else {
      Swal.fire("Warning", "No changes made", "info");
    }
  } catch (err) {
    console.error("Edit failed:", err);
    Swal.fire("Error", "❌ Assignment update failed", "error");
  } finally {
    setUploadingAssignments((prev) => ({ ...prev, [inputKey]: false }));
  }
};


  console.log(routines);
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-center mb-6">
        Faculty Weekly Routine
      </h2>

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
          No routines found for this month.
        </p>
      ) : (
        <div className="overflow-x-auto">
          {routines.map((routine, i) => (
            <div key={i} className="border rounded-lg p-4 mb-6 shadow bg-white">
              <div className="mb-4">
                <h3 className="font-bold text-lg">
                  {routine.department} - {routine.semester}
                </h3>
                <p className="text-sm text-gray-500">
                  Week Start:{" "}
                  {dayjs(routine.weekStartDate).format("MMMM D, YYYY")}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full border">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="border p-2">Day</th>
                      <th className="border p-2">Course</th>
                      <th className="border p-2">Time</th>
                      <th className="border p-2">Online Link</th>
                      <th className="border p-2">Status</th>
                      <th className="border p-2">Action</th>
                      <th className="border p-2">Class Assignment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routine.routines.map((dayRoutine, idx) =>
                      dayRoutine.facultyEmails?.includes(email) ? (
                        <React.Fragment key={idx}>
                          <tr>
                            <td className="border p-2">{dayRoutine.day}</td>
                            <td className="border p-2">
                              {dayRoutine.course || "N/A"}
                            </td>
                            <td className="border p-2">{dayRoutine.time}</td>
                            <td className="border p-2">
                              <a
                                href={dayRoutine.onlineLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                Join Class
                              </a>
                            </td>
                            <td className="border p-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  dayRoutine.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : dayRoutine.status === "in-progress"
                                    ? "bg-blue-100 text-blue-700"
                                    : dayRoutine.status === "canceled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {dayRoutine.status || "pending"}
                              </span>
                            </td>
                            <td className="border p-2 space-y-2">
                              {dayRoutine.status !== "completed" &&
                                dayRoutine.status !== "canceled" && (
                                  <div>
                                    {dayRoutine.status !== "in-progress" && (
                                      <button
                                        className="btn btn-xs bg-prime text-black hover:bg-highlight hover:text-white mr-1"
                                        onClick={() =>
                                          handleStatusUpdate(
                                            routine._id,
                                            idx,
                                            "in-progress"
                                          )
                                        }
                                      >
                                        Start
                                      </button>
                                    )}

                                    {dayRoutine.status !== "in-progress" && (
                                      <button
                                        className="btn btn-xs bg-red-400 text-black hover:bg-red-500 hover:text-white mr-1"
                                        onClick={() =>
                                          handleStatusUpdate(
                                            routine._id,
                                            idx,
                                            "canceled"
                                          )
                                        }
                                      >
                                        Cancel
                                      </button>
                                    )}

                                    {dayRoutine.status === "in-progress" && (
                                      <>
                                        <button
                                          className="btn btn-xs bg-gray-300 text-gray-700 cursor-not-allowed mr-1"
                                          disabled
                                        >
                                          Cannot Cancel
                                        </button>
                                        <button
                                          className="btn btn-xs bg-green-400 text-black hover:bg-green-500 hover:text-white"
                                          onClick={() =>
                                            handleStatusUpdate(
                                              routine._id,
                                              idx,
                                              "completed"
                                            )
                                          }
                                        >
                                          Complete
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}

                              {dayRoutine.status === "completed" && (
                                <>
                                  {dayRoutine.notes?.url &&
                                  !editStates[`${routine._id}_${idx}`] ? (
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={dayRoutine?.notes?.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                      >
                                        📄Notes
                                      </a>
                                      <button
                                        type="button"
                                        className="btn btn-xs btn-warning"
                                        onClick={() =>
                                          setEditStates((prev) => ({
                                            ...prev,
                                            [`${routine._id}_${idx}`]: true,
                                          }))
                                        }
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  ) : (
                                    <form
                                      className="flex items-center gap-2"
                                      onSubmit={(e) =>
                                        handleNotesUpload(
                                          e,
                                          routine._id,
                                          idx,
                                          dayRoutine.course,
                                          dayRoutine.day
                                        )
                                      }
                                    >
                                      <input
                                        type="file"
                                        name="file"
                                        accept=".pdf"
                                        ref={(el) => {
                                          if (el)
                                            fileInputRefs.current[
                                              `${routine._id}_${idx}`
                                            ] = el;
                                        }}
                                        className="file-input file-input-sm file-input-bordered file-input-accent"
                                      />
                                      <button
                                        type="submit"
                                        className="btn btn-sm bg-accent text-black hover:bg-blue-500 hover:text-white"
                                      >
                                        Upload
                                      </button>
                                    </form>
                                  )}
                                </>
                              )}
                            </td>
                          <td className="border p-2 space-y-2">
  {dayRoutine.status === "completed" ? (
<>
  {dayRoutine.assignment?.url &&
  !editAssignmentStates[`${routine._id}_${idx}`] ? (
    <div className="flex items-center gap-2">
      <a
        href={dayRoutine?.assignment?.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-700 underline"
      >
        📌 Assignment
      </a>
      {/* ✅ Show Edit only if no submissions exist */}
      {(!dayRoutine.subAssignments || dayRoutine.subAssignments.length === 0) && (
        <button
          type="button"
          className="btn btn-xs btn-warning"
          onClick={() =>
            setEditAssignmentStates((prev) => ({
              ...prev,
              [`${routine._id}_${idx}`]: true,
            }))
          }
        >
          Edit
        </button>
      )}
    </div>
  ) : (
    // ✅ Upload/Edit form allowed only if no student has submitted
    (!dayRoutine.subAssignments || dayRoutine.subAssignments.length === 0) ? (
      <form
        className="flex items-center gap-2"
        onSubmit={(e) =>
          editAssignmentStates[`${routine._id}_${idx}`]
            ? handleAssignmentEditUpload(
                e,
                routine._id,
                idx,
                dayRoutine.course,
                dayRoutine.day
              )
            : handleAssignmentUpload(
                e,
                routine._id,
                idx,
                dayRoutine.course,
                dayRoutine.day
              )
        }
      >
        <input
          type="file"
          name="assignment"
          accept=".pdf"
          ref={(el) => {
            if (el)
              assignmentInputRefs.current[`${routine._id}_${idx}`] = el;
          }}
          className="file-input file-input-sm file-input-bordered file-input-success"
        />
        <button
          type="submit"
          className="btn btn-sm bg-green-300 text-black hover:bg-green-500 hover:text-white"
          disabled={uploadingAssignments[`${routine._id}_${idx}`]}
        >
          {uploadingAssignments[`${routine._id}_${idx}`]
            ? "Uploading..."
            : "Upload"}
        </button>
      </form>
    ) : (
      <p className="text-sm italic text-gray-400">
        Cannot edit – student submissions exist
      </p>
    )
  )}

  {dayRoutine.assignment?.url && (
    <div className="pt-2">
      <button
        type="button"
        className="btn btn-xs btn-outline btn-info"
        onClick={() =>
          setExpandedRows((prev) => ({
            ...prev,
            [`${routine._id}_${idx}`]: !prev[`${routine._id}_${idx}`],
          }))
        }
      >
        {expandedRows[`${routine._id}_${idx}`]
          ? "Hide Submissions"
          : "Submissions"}
      </button>
    </div>
  )}
</>

  ) : (
    <span className="text-sm text-gray-400 italic">
      Not available
    </span>
  )}
</td>

                          </tr>

                          {/* 🔽 Expandable Row for Student Submissions */}
                          {expandedRows[`${routine._id}_${idx}`] && (
                            <tr>
                              <td colSpan={7} className="bg-gray-50 p-4">
                                {dayRoutine.subAssignments?.length ? (
                                  <ul className="list-disc pl-5 space-y-1">
                                    {dayRoutine.subAssignments.map((s, i) => (
                                      <li key={i}>
                                        👤 {s.studentName} —{" "}
                                        <a
                                          href={s.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 underline"
                                        >
                                          Submission
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">
                                    No student submissions available.
                                  </p>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ) : null
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyRoutine;
