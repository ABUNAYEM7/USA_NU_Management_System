import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import AxiosSecure from "../../Components/Hooks/AxiosSecure";
import { FaArrowLeft } from "react-icons/fa";

const ViewSubmissions = () => {
  const { assignmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const assignmentTitle = location.state?.title || "Assignment";
  const axiosInstance = AxiosSecure();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axiosInstance.get(
          `/assignment-submissions/${assignmentId}`
        );
        setSubmissions(res.data || []);
      } catch (error) {
        Swal.fire("Error", "Failed to load submissions", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  if (loading)
    return <div className="text-center mt-10">Loading submissions...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10 bg-white shadow-xl rounded-xl">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          Submissions for:{" "}
          <span className="text-highlight">{assignmentTitle}</span>
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline flex items-center gap-2"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      {submissions.length === 0 ? (
        <p className="text-center">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left border">#</th>
                <th className="p-3 text-left border">Student</th>
                <th className="p-3 text-left border">Email</th>
                <th className="p-3 text-left border">Status</th>
                <th className="p-3 text-left border">Submitted At</th>
                <th className="p-3 text-left border">File</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, index) => (
                <tr key={sub._id || index} className="hover:bg-gray-50">
                  <td className="p-3 border">{index + 1}</td>
                  <td className="p-3 border">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img
                            src={
                              sub.studentPhoto ||
                              "https://i.ibb.co/2K2tkj1/default-avatar.png"
                            }
                            alt="Student"
                          />
                        </div>
                      </div>
                      <p className="font-medium">
                        {sub.studentName || "Unknown"}
                      </p>
                    </div>
                  </td>
                  <td className="p-3 border">{sub.email}</td>
                  <td className="p-3 border">
                    <span className="badge badge-success">
                      {sub.status || "Submitted"}
                    </span>
                  </td>
                  <td className="p-3 border">
                    {sub.submittedAt
                      ? dayjs(sub.submittedAt).format("DD MMM YYYY")
                      : "N/A"}
                  </td>
                  <td className="p-3 border">
                    {sub.path ? (
                      <a
                        href={`http://localhost:3000/${sub.path.replace(
                          /\\/g,
                          "/"
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View
                      </a>
                    ) : (
                      "No File"
                    )}
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

export default ViewSubmissions;
