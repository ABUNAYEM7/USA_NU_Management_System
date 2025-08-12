import React, { useEffect, useState } from "react";
import useFetchData from "../../../Components/Hooks/useFetchData";
import { FaBookOpen, FaChalkboardTeacher, FaClock } from "react-icons/fa";
import { MdOutlineCalendarToday } from "react-icons/md";
import Swal from "sweetalert2";
import useAuth from "../../../Components/Hooks/useAuth";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";

const StudentsCourses = () => {
  const { user } = useAuth();
  const axiosSecure = AxiosSecure();

  const { data: student, refetch: refetchStudent, loading: studentLoading } = useFetchData(
    `${user?.email}`,
    `/student/${user?.email}`
  );

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalCourses, setTotalCourses] = useState(0);
  const [requestedCourseIds, setRequestedCourseIds] = useState([]);

  const enrolledCourseIds = student?.courses?.map((c) => c.courseId) || [];

  useEffect(() => {
    const fetchCourses = async () => {
      if (student?.department) {
        setLoading(true);
        try {
          const res = await axiosSecure.get(
            `/all-courses-by-department?department=${student.department}&page=${page}&limit=${limit}`
          );
          setCourses(res.data.courses);
          setTotalCourses(res.data.total);
        } catch (err) {
          console.error("Error fetching courses by department:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCourses();
  }, [student?.department, page, limit, axiosSecure]);

  
useEffect(() => {
  const fetchRequests = async () => {
    if (!user?.email) return;

    try {
      const res = await axiosSecure.get(`/enrollment-requests/${user.email}`);
      const pendingIds = res.data
        .filter((r) => r.status === "pending")
        .map((r) => r.courseId);
      setRequestedCourseIds(pendingIds);
    } catch (err) {
      console.error("Error fetching enrollment requests:", err);
    }
  };

  fetchRequests();
}, [user?.email, axiosSecure]);

const handleEnrollmentRequest = async (course) => {
  try {
    const res = await axiosSecure.post("/request-enrollment", {
      email: user?.email,
      courseId: course._id,
      courseCode: course.courseId,
      courseName: course.name,
      studentName: student?.name,
      studentDepartment: student?.department,
       quarter: course.semester
    });

    if (res.data?.success) {
      // ✅ Update state immediately
      setRequestedCourseIds((prev) => [...prev, course._id]);

      Swal.fire({
        icon: "info",
        title: "Request Sent",
        text: `Your enrollment request for ${course.name} has been sent to the admin.`,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error("Enrollment request error:", error);
    Swal.fire({
      icon: "error",
      title: "Request Failed",
      text: error?.response?.data?.message || "Something went wrong. Try again.",
    });
  }
};


const renderCourseCard = (course, isEnrolled) => {
  const isRequested = requestedCourseIds.includes(course._id);

  return (
    <div
      key={course._id}
      className="card bg-white shadow-md hover:shadow-xl transition duration-300 border-t-4 border-primary mt-4"
    >
      <div className="card-body">
        <h2 className="card-title text-xl text-highlight">
          <FaBookOpen /> {course.name}
        </h2>
        <h2 className="card-title text-xl text-highlight">
          Course Code : {course.courseId}
        </h2>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <FaChalkboardTeacher /> Instructor: {course.facultyName || "TBD"}
        </p>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <FaClock /> Credit Hours: {course.credit}
        </p>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          🎓 Quarter: {course.semester || "Not specified"}
        </p>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <MdOutlineCalendarToday /> Start Date: {course.date || "N/A"}
        </p>
        <p className="text-gray-600 mt-2 text-sm">
          {course.description?.slice(0, 100) || "No description available."}
        </p>

        <div className="card-actions justify-end mt-4">
          <button
            disabled={isEnrolled || isRequested}
            onClick={() => handleEnrollmentRequest(course)}
            className={`btn btn-sm ${
              isEnrolled
                ? "btn-disabled bg-gray-400"
                : isRequested
                ? "bg-yellow-400 text-white"
                : "bg-primary text-white"
            }`}
          >
            {isEnrolled ? "Enrolled" : isRequested ? "Requested" : "Request Enroll"}
          </button>
        </div>
      </div>
    </div>
  );
};


  const totalPages = Math.ceil(totalCourses / limit);

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Courses</h2>

      {studentLoading || loading ? (
        <p className="text-center text-lg">Loading courses...</p>
      ) : (
        <>
          {enrolledCourseIds.length > 0 && (
            <div className="mb-10">
              <h3 className="text-2xl font-semibold text-primary mb-4">Enrolled Courses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses
                  .filter((c) => enrolledCourseIds.includes(c._id))
                  .map((course) => renderCourseCard(course, true))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-2xl font-semibold text-primary mb-4">Other Available Courses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses
                .filter((c) => !enrolledCourseIds.includes(c._id))
                .map((course) => renderCourseCard(course, false))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={`btn btn-sm ${page === idx + 1 ? "btn-primary" : "btn-outline"}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}

          {courses?.length === 0 && (
            <p className="text-center col-span-3 text-gray-500 mt-8">
              No courses available for your department.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default StudentsCourses;
