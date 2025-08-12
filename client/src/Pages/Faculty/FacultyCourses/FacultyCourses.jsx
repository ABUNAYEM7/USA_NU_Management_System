import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import useAuth from "../../../Components/Hooks/useAuth";
import { FaBookOpen, FaCalendarAlt, FaUserGraduate } from "react-icons/fa";

const FacultyCourses = () => {
  const { user } = useAuth();
  const email = user?.email;
  const navigate = useNavigate();
  const axiosSecure = AxiosSecure();

  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(12); // Courses per page

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await axiosSecure.get(
          `/faculty-assign/courses/${email}?page=${page}&limit=${limit}`
        );
        setCourses(res.data?.courses || []);
        setTotalCourses(res.data?.total || 0);
      } catch (err) {
        console.error("Error fetching assigned courses:", err);
        setError("Something went wrong while fetching courses.");
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchCourses();
  }, [email, page, limit, axiosSecure]);

  const handleViewDetails = (id) => {
    navigate(`/dashboard/faculty-courses/details/${id}`);
  };

  const totalPages = Math.ceil(totalCourses / limit);

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-prime">
        Courses Assigned to You
      </h1>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <span className="loading loading-bars loading-lg text-primary"></span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      )}

      {!loading && courses?.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          <p>No courses assigned yet.</p>
        </div>
      )}

      {!loading && courses?.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <div
                key={idx}
                className="card bg-white shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
              >
                <div className="card-body">
                  <h2 className="card-title text-xl font-semibold text-primary">
                    <FaBookOpen className="inline-block mr-2" />
                    {course.name}
                  </h2>

                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Department:</strong> {course.department}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Course Code:</strong> {course.courseId}
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    <FaUserGraduate className="inline-block mr-1" />
                    <strong>Credit:</strong> {course.credit}
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    <FaCalendarAlt className="inline-block mr-1" />
                    <strong>Assigned On:</strong>{" "}
                    {new Date(course.date).toLocaleDateString()}
                  </p>

                  <p className="text-sm text-gray-700 mt-2">
                    {course.description?.slice(0, 120)}...
                  </p>

                  <div className="card-actions justify-end mt-4">
                    <button
                      className="btn btn-sm btn-outline bg-prime"
                      onClick={() => handleViewDetails(course._id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={`btn btn-sm ${
                    page === idx + 1 ? "btn-primary" : "btn-outline"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FacultyCourses;
