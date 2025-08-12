import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import AxiosSecure from "../Hooks/AxiosSecure";
import { FaArrowLeft } from "react-icons/fa";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import GenerateFacultyReport from "../../Pages/Faculty/GenerateFacultyReport/GenerateFacultyReport";
import ManualStudentPaymentForm from "../../Pages/Admin/ManualStudentPaymentForm/ManualStudentPaymentForm";

const ViewUserDetails = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const axiosInstance = AxiosSecure();

  const [user, setUser] = useState(null);
  const [extraDetails, setExtraDetails] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [studentCourses, setStudentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [feeInputs, setFeeInputs] = useState({});
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [studentLimit] = useState(10);
  const [totalAssignedCourses, setTotalAssignedCourses] = useState(0);
  const [studentPage, setStudentPage] = useState(1);
  const [totalStudentCourses, setTotalStudentCourses] = useState(0);
  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [assignmentLimit] = useState(10);
  const [totalFacultyAssignments, setTotalFacultyAssignments] = useState(0);
  const [facultyMaterials, setFacultyMaterials] = useState([]);
  const [materialsPage, setMaterialsPage] = useState(1);
  const [materialsLimit] = useState(10); // or any number you prefer
  const [totalFacultyMaterials, setTotalFacultyMaterials] = useState(0);
  const [manualPayments, setManualPayments] = useState([]);

  useEffect(() => {
    const fetchUserAndDetails = async () => {
      try {
        const userRes = await axiosInstance.get(`/user-details/${email}`);
        const userData = userRes?.data;
        setUser(userData);

        if (userData?.role === "faculty") {
          const facultyRes = await axiosInstance.get(`/faculty-email/${email}`);
          setExtraDetails(facultyRes?.data);

          const courseRes = await axiosInstance.get(
            `/faculty-assign/courses/${email}?page=${page}&limit=${limit}`
          );
          setAssignedCourses(courseRes?.data?.courses || []);
          setTotalAssignedCourses(courseRes?.data?.total || 0);

          // ✅ Corrected assignment fetch
          const assignmentRes = await axiosInstance.get(
            `/assignments/${email}?page=${assignmentPage}&limit=${assignmentLimit}`
          );
          const materialRes = await axiosInstance.get(
            `/materials/${email}?page=${materialsPage}&limit=${materialsLimit}`
          );
          setFacultyMaterials(materialRes?.data?.materials || []);
          setTotalFacultyMaterials(materialRes?.data?.total || 0);

          setFacultyAssignments(assignmentRes?.data?.assignments || []);
          setTotalFacultyAssignments(assignmentRes?.data?.total || 0);
        } else if (userData?.role === "student") {
          const studentRes = await axiosInstance.get(
            `/student-full-details/${email}?page=${studentPage}&limit=${studentLimit}`
          );

          const paymentHistoryRes = await axiosInstance.get(
            `/payment-history/${email}`
          );
          setManualPayments(paymentHistoryRes.data?.history || []);

          const initialFees = {};
          (studentRes?.data?.student?.courses || []).forEach((course, idx) => {
            initialFees[idx] = course?.fee || 0;
          });
          setFeeInputs(initialFees);

          setExtraDetails(studentRes?.data?.student || {});
          setStudentCourses(studentRes?.data?.student?.courses || []);
          setTotalStudentCourses(studentRes?.data?.totalCourses || 0);
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching user details:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndDetails();
  }, [email, axiosInstance, page, studentPage, assignmentPage, materialsPage]);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!user || !extraDetails) {
    return (
      <div className="text-center mt-10 text-red-500">
        User details not available.
      </div>
    );
  }

  // handle save
  const handleSaveFee = async (index, course) => {
    try {
      const updatedFee = parseFloat(feeInputs[index]);

      if (isNaN(updatedFee) || updatedFee < 0) {
        Swal.fire({
          icon: "error",
          title: "Invalid fee amount",
          text: "Please enter a valid positive number.",
        });
        return;
      }

      const response = await axiosInstance.patch(
        `/update-student-course-fee/${extraDetails?._id}`,
        {
          courseId: course.courseId,
          newFee: updatedFee,
        }
      );

      if (response?.data?.success) {
        setEditingIndex(null);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Fee updated successfully!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to update fee.",
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error saving fee:", error);
      }
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Server error while saving fee.",
      });
    }
  };

  // progressHandler
  const progressHandler = (email) => {
    navigate(`/dashboard/student-progress/${email}`);
  };

  const handleViewSubmissions = (assignment) => {
    navigate(`/dashboard/view-submissions/${assignment._id}`, {
      state: {
        title: assignment.title,
        courseName: assignment.courseName,
      },
    });
  };
  return (
    <div className="max-w-6xl mx-auto p-8 bg-base-100 shadow-xl rounded-3xl border border-gray-300 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          {user?.role === "faculty" ? "Faculty" : "Student"} Details
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline flex items-center gap-2"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="avatar">
            <div className="w-48 rounded-full ring ring-highlight ring-offset-base-100 ring-offset-2">
              <img
                src={
                  user?.photo ||
                  extraDetails?.staffPhoto ||
                  "https://i.ibb.co/2K2tkj1/default-avatar.png"
                }
                alt="Avatar"
              />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              {user?.name ||
                `${extraDetails?.firstName || ""} ${
                  extraDetails?.lastName || ""
                }`}
            </h2>
            <p className="text-lg text-gray-500">
              {user?.email || "No email available"}
            </p>
            {extraDetails?.designation && (
              <div className="mt-2 badge badge-info text-white">
                {extraDetails?.designation}
              </div>
            )}
          </div>
        </div>
        {/* basic details container */}
        <div className="grid grid-cols-1 gap-4">
          {user?.role === "faculty" && (
            <>
              <p>
                <strong>Staff No:</strong> {extraDetails?.staffNo || "N/A"}
              </p>
              <p>
                <strong>Role:</strong> {extraDetails?.role || "N/A"}
              </p>
              <p>
                <strong>Gender:</strong> {extraDetails?.gender || "N/A"}
              </p>
              <p>
                <strong>DOB:</strong> {extraDetails?.dob || "N/A"}
              </p>
              <p>
                <strong>DOJ:</strong> {extraDetails?.doj || "N/A"}
              </p>
              <p>
                <strong>Mobile:</strong> {extraDetails?.mobile || "N/A"}
              </p>
              <p>
                <strong>Father's Name:</strong>{" "}
                {extraDetails?.fatherName || "N/A"}
              </p>
              <p>
                <strong>Mother's Name:</strong>{" "}
                {extraDetails?.motherName || "N/A"}
              </p>
              <p>
                <strong>Current Address:</strong>{" "}
                {extraDetails?.currentAddress || "N/A"}
              </p>
              <p>
                <strong>Permanent Address:</strong>{" "}
                {extraDetails?.permanentAddress || "N/A"}
              </p>
              <p>
                <strong>Assigned Courses:</strong>{" "}
                {assignedCourses?.length || 0}
              </p>
            </>
          )}

          {user?.role === "student" && (
            <>
              <p>
                <strong>Department:</strong> {extraDetails?.department || "N/A"}
              </p>
              <p>
                <strong>Gender:</strong> {extraDetails?.gender || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {extraDetails?.city || "N/A"}
              </p>
              <p>
                <strong>Country:</strong> {extraDetails?.country || "N/A"}
              </p>
              <p>
                <strong>Current Address:</strong>{" "}
                {extraDetails?.currentAddress || "N/A"}
              </p>
              <p>
                <strong>Permanent Address:</strong>{" "}
                {extraDetails?.permanentAddress || "N/A"}
              </p>
              <p>
                <strong>Enrolled Courses:</strong> {totalStudentCourses || 0}
              </p>
              <button
                onClick={() => progressHandler(email)}
                className="btn bg-highlight text-white"
              >
                View Student Progress
              </button>
            </>
          )}
        </div>
      </div>

      {/* Faculty Assigned Courses */}
      {user?.role === "faculty" && assignedCourses?.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4">
            Assigned Course Details
          </h3>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course ID</th>
                  <th>Course Name</th>
                  <th>Credit</th>
                  <th>Semester</th>
                  <th>Department</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {assignedCourses?.map((course, index) => (
                  <tr key={course?._id || index}>
                    <td>{(page - 1) * limit + index + 1}</td>
                    <td>{course?.courseId || "N/A"}</td>
                    <td>{course?.name || "N/A"}</td>
                    <td>{course?.credit || "N/A"}</td>
                    <td>{course?.semester || "N/A"}</td>
                    <td>{course?.department || "N/A"}</td>
                    <td>
                      {course?.date
                        ? dayjs(course.date).format("DD MMM YYYY")
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalAssignedCourses > limit && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                className="btn btn-sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <span className="font-medium">
                Page {page} of {Math.ceil(totalAssignedCourses / limit)}
              </span>
              <button
                className="btn btn-sm"
                disabled={page >= Math.ceil(totalAssignedCourses / limit)}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* faculty created assignments */}
      {user?.role === "faculty" && facultyAssignments?.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4">Created Assignments</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course Name</th>
                  <th>Title</th>
                  <th>Semester</th>
                  <th>Released</th>
                  <th>Deadline</th>
                  <th>PDF File</th>
                  <th>Submission</th>
                </tr>
              </thead>
              <tbody>
                {facultyAssignments.map((assignment, idx) => (
                  <tr key={assignment.assignmentId || idx}>
                    <td>{(assignmentPage - 1) * assignmentLimit + idx + 1}</td>
                    <td>{assignment.courseName || "N/A"}</td>
                    <td>{assignment.title || "Untitled"}</td>
                    <td>{assignment.semester || "N/A"}</td>
                    <td>
                      {assignment.uploadedAt
                        ? dayjs(assignment.uploadedAt).format("DD MMM YYYY")
                        : "N/A"}
                    </td>
                    <td>
                      {assignment.deadline
                        ? dayjs(assignment.deadline).format("DD MMM YYYY")
                        : "N/A"}
                    </td>
                    <td>
                      {assignment.path ? (
                        <a
                          href={`http://localhost:3000/${assignment?.path?.replace(
                            /\\/g,
                            "/"
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View PDF
                        </a>
                      ) : (
                        "No File"
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-xs btn-outline btn-info mt-1"
                        onClick={() => handleViewSubmissions(assignment)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📄 Pagination Buttons Outside Table */}
          {totalFacultyAssignments > assignmentLimit && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                className="btn btn-sm"
                disabled={assignmentPage === 1}
                onClick={() =>
                  setAssignmentPage((prev) => Math.max(prev - 1, 1))
                }
              >
                Previous
              </button>
              <span className="font-medium">
                Page {assignmentPage} of{" "}
                {Math.ceil(totalFacultyAssignments / assignmentLimit)}
              </span>
              <button
                className="btn btn-sm"
                disabled={
                  assignmentPage >=
                  Math.ceil(totalFacultyAssignments / assignmentLimit)
                }
                onClick={() => setAssignmentPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* faculty uploaded materials */}
      {user?.role === "faculty" && facultyMaterials?.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4">Uploaded Materials</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Course ID</th>
                  <th>Department</th>
                  <th>Uploaded At</th>
                  <th>PDF File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facultyMaterials.map((material, idx) => (
                  <tr key={material._id || idx}>
                    <td>{(materialsPage - 1) * materialsLimit + idx + 1}</td>
                    <td>{material.title || "Untitled"}</td>
                    <td>{material.courseId || "N/A"}</td>
                    <td>{material.department || "N/A"}</td>
                    <td>
                      {material.uploadedAt
                        ? dayjs(material.uploadedAt).format("DD MMM YYYY")
                        : "N/A"}
                    </td>
                    <td>
                      {material.path ? (
                        <a
                          href={`http://localhost:3000/${material.path.replace(
                            /\\/g,
                            "/"
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View PDF
                        </a>
                      ) : (
                        "No File"
                      )}
                    </td>
                    <td className="flex gap-2">
                      <a
                        href={`http://localhost:3000/${material.path.replace(
                          /\\/g,
                          "/"
                        )}`}
                        download
                        className="btn btn-sm btn-outline btn-info"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Pagination Buttons Outside Table */}
          {totalFacultyMaterials > materialsLimit && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                className="btn btn-sm"
                disabled={materialsPage === 1}
                onClick={() =>
                  setMaterialsPage((prev) => Math.max(prev - 1, 1))
                }
              >
                Previous
              </button>
              <span className="font-medium">
                Page {materialsPage} of{" "}
                {Math.ceil(totalFacultyMaterials / materialsLimit)}
              </span>
              <button
                className="btn btn-sm"
                disabled={
                  materialsPage >=
                  Math.ceil(totalFacultyMaterials / materialsLimit)
                }
                onClick={() => setMaterialsPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* faculty quarterly report */}
      {user?.role === "faculty" && (
        <GenerateFacultyReport email={user?.email} name={user?.name} />
      )}

      {/* Student Enrolled Courses Table */}
      {user?.role === "student" && studentCourses?.length > 0 && (
        <>
          <div className="mt-10">
            <ManualStudentPaymentForm
              email={user?.email}
              studentId={extraDetails?.studentId}
              name={user?.name}
            />
          </div>
          <div className="mt-10">
            <h3 className="text-2xl font-semibold mb-4">
              Enrolled Course Details
            </h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Course Name</th>
                    <th>Credit</th>
                    <th>Semester</th>
                    <th>Enrollment Date</th>
                    <th>Payment Status</th>
                    <th>Assigned Fee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentCourses.map((course, index) => (
                    <tr key={course?._id || index}>
                      <td>{(studentPage - 1) * studentLimit + index + 1}</td>
                      <td>{course?.courseName || "N/A"}</td>
                      <td>{course?.credit || "N/A"}</td>
                      <td>{course?.semester || "N/A"}</td>
                      <td>
                        {course?.enrolledAt
                          ? dayjs(course.enrolledAt).format("DD MMM YYYY")
                          : "N/A"}
                      </td>
                      <td>
                        <span className="badge badge-warning">
                          {course?.paymentStatus || "Unpaid"}
                        </span>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="input input-bordered input-sm w-24"
                          value={feeInputs[index]}
                          disabled={!(editingIndex === index)}
                          onChange={(e) =>
                            setFeeInputs((prev) => ({
                              ...prev,
                              [index]: e.target.value,
                            }))
                          }
                          min="0"
                        />
                      </td>
                      <td className="flex gap-2">
                        {editingIndex === index ? (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleSaveFee(index, course)}
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-accent"
                            onClick={() => setEditingIndex(index)}
                            disabled={course?.paymentStatus === "paid"}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination outside the table */}
            {totalStudentCourses > studentLimit && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  className="btn btn-sm"
                  disabled={studentPage === 1}
                  onClick={() =>
                    setStudentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  Previous
                </button>
                <span className="font-medium">
                  Page {studentPage} of{" "}
                  {Math.ceil(totalStudentCourses / studentLimit)}
                </span>
                <button
                  className="btn btn-sm"
                  disabled={
                    studentPage >= Math.ceil(totalStudentCourses / studentLimit)
                  }
                  onClick={() => setStudentPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
          {manualPayments.length > 0 && (
            <div className="mt-10">
              <h3 className="text-2xl font-semibold mb-4">
                Other Payments (Manual Entry)
              </h3>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subject</th>
                      <th>Amount ($)</th>
                      <th>Status</th>
                      <th>Recorded By</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualPayments.map((payment, idx) => (
                      <tr key={payment._id || idx}>
                        <td>{idx + 1}</td>
                        <td>{payment.subject}</td>
                        <td>{payment.amount}</td>
                        <td>
                          <span
                            className={`badge ${
                              payment.status === "paid"
                                ? "badge-success"
                                : "badge-warning"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td>{payment.recordedBy || "N/A"}</td>
                        <td>{dayjs(payment.date).format("DD MMM YYYY")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewUserDetails;
