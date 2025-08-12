import React, { useState } from "react";
import useFetchData from "../../../Components/Hooks/useFetchData";
import Countdown from "react-countdown";
import useAuth from "../../../Components/Hooks/useAuth";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import Swal from "sweetalert2";

const StudentAssignment = () => {
  const { user } = useAuth();
  const axiosInstance = AxiosSecure();
  const [submissionFiles, setSubmissionFiles] = useState({});
  const [comments, setComments] = useState({});
  const [submitting, setSubmitting] = useState({});

  const {
    data: assignments = [],
    refetch,
    loading,
  } = useFetchData(
    `student-assignments-${user?.email}`,
    `/students-assignment/${user?.email}`
  );

  const handleFileChange = (e, id) => {
    setSubmissionFiles({ ...submissionFiles, [id]: e.target.files[0] });
  };

  const handleCommentsChange = (e, id) => {
    setComments({ ...comments, [id]: e.target.value });
  };

  const handleSubmit = async (assignmentId) => {
    const file = submissionFiles[assignmentId];
    if (!file) return alert("Please select a file first.");

    // Disable the button for this assignment
    setSubmitting((prev) => ({ ...prev, [assignmentId]: true }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assignmentId", assignmentId);
    formData.append("comments", comments[assignmentId] || "");
    formData.append("email", user?.email);

    try {
      const res = await axiosInstance.post(`/assignment-submission`, formData);
      if (res?.data?.insertedId) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Your assignment has been submitted",
          showConfirmButton: false,
          timer: 1500,
        });
        refetch(); // ✅ refresh submitted state
      }
    } catch (err) {
      console.error("Submission error:", err);
      // Optional: re-enable on failure
      setSubmitting((prev) => ({ ...prev, [assignmentId]: false }));
    }
  };

  const renderer = ({ days, hours, minutes, seconds, completed }) => (
    <span
      className={`font-semibold ${
        completed ? "text-red-500" : "text-green-500"
      }`}
    >
      {completed
        ? "Deadline Passed"
        : `${String(days).padStart(2, "0")}d ${String(hours).padStart(
            2,
            "0"
          )}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(
            2,
            "0"
          )}s`}
    </span>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 mt-4">
      <h1 className="text-3xl font-bold text-center mb-8">My Assignments</h1>

      {assignments.length === 0 && (
        <p className="text-center text-gray-500">
          No assignments found. Please enroll in a course.
        </p>
      )}

      {assignments?.map((item) => {
        const deadlinePassed = new Date(item.deadline) < new Date();
        const hasSubmitted = item.submission?.submitted;

        return (
          <div key={item._id} className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title text-xl">{item.title}</h2>
              <p>
                <strong>Instructions:</strong> {item.instructions}
              </p>
              <p>
                <strong>Quarter:</strong> {item.semester || "General"}
              </p>
              <p>
                <strong>Course ID:</strong> {item.courseCode}
              </p>
              <p>
                <strong>Uploaded By:</strong> {item.email}
              </p>
              <p>
                <strong>Uploaded At:</strong>{" "}
                {new Date(item.uploadedAt).toLocaleString()}
              </p>
              <p>
                <strong>Deadline:</strong>{" "}
                {new Date(item.deadline).toLocaleString()}
              </p>
              {!hasSubmitted && (
                <p>
                  <strong>Time Remaining:</strong>{" "}
                  <Countdown
                    date={new Date(item.deadline)}
                    renderer={renderer}
                  />
                </p>
              )}

              <a
                className="btn btn-outline btn-sm mt-3"
                href={item.firebaseUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Assignment
              </a>

              {!hasSubmitted ? (
                <div className="mt-4">
                  <input
                    type="file"
                    className="file-input w-full"
                    onChange={(e) => handleFileChange(e, item._id)}
                    disabled={deadlinePassed}
                  />

                  <textarea
                    className="textarea textarea-bordered w-full mt-3"
                    placeholder="Any comments (optional)"
                    onChange={(e) => handleCommentsChange(e, item._id)}
                    disabled={deadlinePassed}
                  />

                  <div className="flex items-center justify-center">
                    <button
                      className="btn bg-highlight text-white mt-3"
                      onClick={() => handleSubmit(item._id)}
                      disabled={deadlinePassed || submitting[item._id]}
                    >
                      {submitting[item._id]
                        ? "Submitting..."
                        : "Submit Assignment"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <a
                    className="btn btn-success text-white mt-4"
                    href={item?.firebaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Submission
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentAssignment;
