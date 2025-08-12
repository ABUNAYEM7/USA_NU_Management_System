import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import { useParams } from "react-router";

const EnrollmentRequests = () => {
  const axiosInstance = AxiosSecure();
  const { email } = useParams();
  const [requests, setRequests] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [quarter, setQuarter] = useState("");

  const quarters = Array.from({ length: 12 }, (_, i) => `Quarter-${i + 1}`);

  // Fetch all enrollment requests
  useEffect(() => {
    if (email) {
      axiosInstance
        .get(`/enrollment-requests/${email}`)
        .then((res) => {
          setRequests(res.data || []);
        })
        .catch((err) => {
          console.error("Failed to fetch enrollment requests:", err);
        });
    }
  }, [email, axiosInstance]);

  // Fetch enrolled courses from student route
  useEffect(() => {
    if (email) {
      axiosInstance
        .get(`/student/${email}`)
        .then((res) => {
          setEnrolledCourses(res.data?.courses || []);
        })
        .catch((err) => {
          console.error("Failed to fetch enrolled courses:", err);
        });
    }
  }, [email, axiosInstance]);

  const handleAction = async (action, request) => {
    try {
      if (action === "approve") {
        const courseRes = await axiosInstance.get(
          `/courses/${request.courseId}`
        );
        const course = courseRes.data;

        const enrollRes = await axiosInstance.post("/enroll-course", {
          email: request.email || email, // <-- Fix here
          course: {
            courseId: request.courseId,
            courseName: request.courseName,
            credit: course?.credit || 0,
            semester: course?.semester || request.quarter,
            fee: course?.fee || 0,
            paymentStatus: "unpaid",
          },
        });

        if (enrollRes.data?.success) {
          await axiosInstance.patch(
            `/enrollment-requests/${request.email || email}/${
              request.courseId
            }`,
            { status: "approved" }
          );
          Swal.fire("✅ Approved!", "Student has been enrolled.", "success");
          setRequests((prev) =>
            prev.map((r) =>
              r._id === request._id ? { ...r, status: "approved" } : r
            )
          );
        }
      } else if (action === "decline") {
        await axiosInstance.patch(
          `/enrollment-requests/${request.email || email}/${request.courseId}`,
          { status: "declined" }
        );
        Swal.fire("❌ Declined", "Request has been declined.", "info");
        setRequests((prev) =>
          prev.map((r) =>
            r._id === request._id ? { ...r, status: "declined" } : r
          )
        );
      }
    } catch (err) {
      console.error("Error processing action:", err);
      Swal.fire("Error", "Something went wrong.", "error");
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const enrolledByQuarter = enrolledCourses.filter(
    (c) => c.semester === quarter
  );
  return (
    <div className="px-6 py-6">
      {/* Pending Requests Section */}
      <h2 className="text-2xl font-bold mb-4 text-center">
        Pending Course Requests
      </h2>
      {pendingRequests.length === 0 ? (
        <p className="text-center text-gray-500">
          No pending requests available now.
        </p>
      ) : (
        <div className="overflow-x-auto mb-10">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Course</th>
                <th>Quarter</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((req) => (
                <tr key={req._id}>
                  <td>{req.courseName}</td>
                  <td>{req.quarter}</td>
                  <td>
                    <span className="badge badge-warning">Pending</span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction("approve", req)}
                        className="btn btn-xs btn-success"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction("decline", req)}
                        className="btn btn-xs btn-error"
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Enrolled Courses Section */}
      <h2 className="text-2xl font-bold mb-4 text-center">
        Enrolled Courses by Quarter
      </h2>

      <div className="mb-4 flex justify-center">
        <select
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
          className="select select-bordered w-full max-w-xs"
        >
          <option value="" disabled>
            Select Quarter
          </option>
          {quarters.map((qtr) => (
            <option key={qtr} value={qtr}>
              {qtr}
            </option>
          ))}
        </select>
      </div>

{quarter === "" ? (
  <p className="text-center text-gray-500">
    Please select a quarter to see enrollment.
  </p>
) : enrolledByQuarter.length === 0 ? (
  <p className="text-center text-gray-500">
    No enrolled courses found for {quarter}.
  </p>
) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Course Code</th>
                <th>Credit</th>
                <th>Quarter</th>
                <th>Fee</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {enrolledByQuarter.map((course, index) => (
                <tr key={index}>
                  <td>{course.courseName}</td>
                  <td>{course.courseId}</td>
                  <td>{course.credit}</td>
                  <td>{course.semester}</td>
                  <td>{course.fee}</td>
                  <td>
                    <span
                      className={`badge ${
                        course.paymentStatus === "paid"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {course.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  </div>
  );
};

export default EnrollmentRequests;
