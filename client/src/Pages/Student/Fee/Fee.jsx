import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "../../../Components/Hooks/useAuth";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";

const Fee = () => {
  const { user } = useAuth();
  const email = user?.email;
  const navigate = useNavigate();
  const axiosSecure = AxiosSecure();

  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [manualPayments, setManualPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalCourses, setTotalCourses] = useState(0);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!email) return;

      setLoading(true);
      try {
        const [res, paymentRes] = await Promise.all([
          axiosSecure.get(`/student-full-details/${email}?page=${page}&limit=${limit}`),
          axiosSecure.get(`/payment-history/${email}`)
        ]);

        setStudent(res.data?.student || {});
        setCourses(res.data?.student?.courses || []);
        setTotalCourses(res.data?.totalCourses || 0);
        setManualPayments(paymentRes.data?.history || []);
      } catch (error) {
        if (process.env.NODE_ENV === "production") {
          console.error("Error fetching student fee data:", error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [email, page, limit, axiosSecure]);

  const handlePayClick = (course) => {
    navigate("/dashboard/payment-page", { state: { course } });
  };

  const totalPages = Math.ceil(totalCourses / limit);

  const manualDue = manualPayments.filter(p => p.type === "manual" && p.status === "due");
  const manualPaid = manualPayments.filter(p => p.type === "manual" && p.status === "paid");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-highlight">
          Your Course Fees
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : courses?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="text-gray-700 text-sm">
                    <th>#</th>
                    <th>Course Name</th>
                    <th>Semester</th>
                    <th>Fee</th>
                    <th>Payment Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr key={`course-${course.courseId || index}`}>
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td>{course?.courseName || "N/A"}</td>
                      <td>{course?.semester || "N/A"}</td>
                      <td>
                        {course?.fee && course?.fee > 0
                          ? `$${course.fee}`
                          : "Not Assigned"}
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {course?.paymentStatus || "unpaid"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={
                            !course?.fee ||
                            course?.fee === 0 ||
                            course.paymentStatus === "paid"
                          }
                          onClick={() => handlePayClick(course)}
                        >
                          Pay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
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
        ) : (
          <p className="text-center text-gray-500">No enrolled courses found.</p>
        )}
      </div>

      {/* Other Manual Due Payments */}
      {manualDue.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl">
          <h2 className="text-2xl font-semibold mb-4 text-highlight">Other Costs</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-gray-700 text-sm">
                  <th>#</th>
                  <th>Subject</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {manualDue.map((item, idx) => (
                  <tr key={`manual-due-${item._id}`}>
                    <td>{idx + 1}</td>
                    <td>{item.subject}</td>
                    <td>${item.amount}</td>
                    <td>
                      <span className="badge badge-warning">{item.status}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handlePayClick(item)}
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paid Manual Payments Section */}
      {manualPaid.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl">
          <h2 className="text-2xl font-semibold mb-4 text-highlight">Other Payment History</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-gray-700 text-sm">
                  <th>#</th>
                  <th>Subject</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Paid At</th>
                </tr>
              </thead>
              <tbody>
                {manualPaid.map((item, idx) => (
                  <tr key={`manual-paid-${item._id}`}>
                    <td>{idx + 1}</td>
                    <td>{item.subject}</td>
                    <td>${item.amount}</td>
                    <td>
                      <span className="badge badge-success">{item.status}</span>
                    </td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fee;
