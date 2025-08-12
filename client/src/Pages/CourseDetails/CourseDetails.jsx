import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import AxiosSecure from "../../Components/Hooks/AxiosSecure";
import CustomLoader from "../../utility/CustomLoader";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosInstance = AxiosSecure();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await axiosInstance.get(`/courses/${id}`);
        setCourse(courseRes.data);

        const studentRes = await axiosInstance.get(`/students-by-course/${id}`);
        setStudents(studentRes.data);
      } catch (error) {
        console.error("❌ Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, axiosInstance]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CustomLoader />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p>❌ Course not found!</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-sm mb-6 bg-prime hover:bg-highlight text-white"
      >
        ← Back to Courses
      </button>

      {/* Course Information */}
      <div className="bg-white shadow rounded p-6 mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">
          Course Name: {course.name}
        </h1>
        <p><strong>Course Code:</strong> {course.courseId}</p>
        <p><strong>Department:</strong> {course.department}</p>
        <p><strong>Credit:</strong> {course.credit}</p>
        <p><strong>Semester:</strong> {course.semester}</p>
        <p><strong>Faculty Email:</strong> {course.facultyEmail}</p>
        <p><strong>Assigned On:</strong> {new Date(course.date).toLocaleDateString()}</p>
        <p><strong>Description:</strong> {course.description}</p>
      </div>

      {/* Enrolled Students Section */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-2xl font-semibold mb-4 text-highlight">
          Enrolled Student Information
        </h2>

        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              {/* Table Head */}
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            <img
                              src={student.photo || "https://img.daisyui.com/images/profile/demo/2@94.webp"}
                              alt="Student Avatar"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>{student.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6">
            No Students Enrolled Currently
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
