import React, { useEffect, useState } from "react";
import useAuth from "../../../Components/Hooks/useAuth";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import Swal from "sweetalert2";
import FacultyLeaveRequests from "../../../Components/FacultyLeaveRequests/FacultyLeaveRequests";

const FacultyAttendance = () => {
  const { user } = useAuth();
  const axiosInstance = AxiosSecure();

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceStatusMap, setAttendanceStatusMap] = useState({});

  const today = new Date().toISOString().split("T")[0];

  // ✅ Fetch courses assigned to this faculty
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.email) return;
      try {
        const res = await axiosInstance.get(`/faculty-assign/courses/${user.email}`);
        setCourses(res.data?.courses || []);
      } catch (err) {
        console.error("Failed to fetch assigned courses:", err);
        setCourses([]);
      }
    };
    fetchCourses();
  }, [user?.email, axiosInstance]);

  // ✅ Fetch students and attendance
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!courseId) {
        setStudents([]);
        setAttendance([]);
        return;
      }

      try {
        const res = await axiosInstance.get(
          `/attendance-status?courseId=${courseId}&date=${today}`
        );
        const alreadySubmitted = res.data?.submitted;

        setAttendanceStatusMap((prev) => ({
          ...prev,
          [courseId]: alreadySubmitted,
        }));

        if (!alreadySubmitted) {
          try {
            const studentRes = await axiosInstance.get(`/students-by-course/${courseId}`);
            const enrolledStudents = studentRes.data;

            const initialAttendance = enrolledStudents.map((student) => ({
              email: student.email,
              status: "present",
            }));

            setStudents(enrolledStudents);
            setAttendance(initialAttendance);
          } catch (studentError) {
            if (studentError.response?.status === 404) {
              setStudents([]);
              setAttendance([]);
            } else {
              console.error("Error fetching students:", studentError);
              Swal.fire("Error", "Could not load students.", "error");
            }
          }
        } else {
          const submittedRes = await axiosInstance.get(
            `/submitted-attendance?courseId=${courseId}&date=${today}`
          );
          setStudents(submittedRes.data.students);
          setAttendance(submittedRes.data.students);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        Swal.fire("Error", "Could not load attendance data.", "error");
      }
    };

    fetchAttendanceData();
  }, [courseId, axiosInstance, today]);

  const handleStatusChange = (email, status) => {
    const updated = attendance.map((a) =>
      a.email === email ? { ...a, status } : a
    );
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    try {
      const res = await axiosInstance.post("/mark-attendance", {
        courseId,
        date: today,
        students: attendance,
        takenBy: user.email,
      });

      if (res.data.insertedId) {
        Swal.fire("Success!", "Attendance marked successfully", "success");
        setAttendanceStatusMap((prev) => ({ ...prev, [courseId]: true }));
      }
    } catch (err) {
      if (err.response?.status === 409) {
        Swal.fire("Warning", "Attendance already taken for today.", "warning");
        setAttendanceStatusMap((prev) => ({ ...prev, [courseId]: true }));
      } else {
        Swal.fire("Error", "Failed to submit attendance", "error");
      }
    }
  };

  const isDisabled = attendanceStatusMap[courseId];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Mark Attendance</h1>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Select Course</label>
        <select
          className="select select-bordered w-full"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          <option value="">-- Select Course --</option>
          {courses?.map((course) => (
            <option key={course._id} value={course._id}>
              {course.name} {course.courseId ? `(${course.courseId})` : ""}
            </option>
          ))}
        </select>
      </div>

      {students.length > 0 ? (
        <>
          <div className="bg-white rounded shadow p-4 mt-6">
            <h2 className="text-lg font-semibold mb-4">Students</h2>
            {isDisabled && (
              <p className="text-green-600 font-semibold mb-2">
                Attendance already submitted for today.
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.email}>
                      <td>{index + 1}</td>
                      <td>{student.email}</td>
                      <td>
                        <select
                          className="select select-sm"
                          value={
                            attendance.find((a) => a.email === student.email)
                              ?.status || "present"
                          }
                          onChange={(e) =>
                            handleStatusChange(student.email, e.target.value)
                          }
                          disabled={isDisabled}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="leave">Leave</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center">
              <button
                className="btn bg-prime"
                onClick={handleSubmit}
                disabled={isDisabled}
              >
                Submit Attendance
              </button>
            </div>
          </div>

          <div className="mt-10">
            <FacultyLeaveRequests facultyEmail={user?.email} courseId={courseId} />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          <p>No one enrolled in this course.</p>
        </div>
      )}
    </div>
  );
};

export default FacultyAttendance;
