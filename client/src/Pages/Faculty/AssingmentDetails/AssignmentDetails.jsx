import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { FaArrowLeft } from "react-icons/fa";
import useFetchData from "../../../Components/Hooks/useFetchData";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";

const AssignmentDetails = () => {
  const { id } = useParams();
  const { data: assignment } = useFetchData(`id`, `/assignment/${id}`);
  const [submissions, setSubmissions] = useState([]);
  const axiosInstance = AxiosSecure();

  useEffect(() => {
    const fetchSubmissions = async () => {
      const res = await axiosInstance.get(`/assignment-submissions/${id}`);
      setSubmissions(res.data);
    };
    fetchSubmissions();
  }, [id, axiosInstance]);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Assignment Details</h1>
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="btn bg-prime text-highlight"
            >
              <FaArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold">Title</p>
            <p>{assignment?.title}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Course ID</p>
            <p>{assignment?.courseCode || "unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Email</p>
            <p>{assignment?.email}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Uploaded At</p>
            <p>{new Date(assignment?.uploadedAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Instructions</p>
            <p>{assignment?.instructions}</p>
          </div>
        </div>

        <div className="mt-4">
          <a
           href={assignment?.firebaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-orange-600 text-white w-full"
          >
            View Assignment File
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Student Submissions</h2>
        {submissions.length > 0 ? (
          <div className="overflow-x-auto border rounded">
            <table className="table w-full text-left">
              <thead className="bg-base-200">
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Comments</th>
                  <th>Submitted At</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s, i) => (
                  <tr key={s._id}>
                    <td>{i + 1}</td>
                    <td>{s.email}</td>
                    <td>{s.comments || "—"}</td>
                    <td>{new Date(s.uploadedAt).toLocaleString()}</td>
                    <td>
                      <a
                        href={s?.firebaseUrl}
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View File
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-red-500">No submissions yet.</p>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetails;
