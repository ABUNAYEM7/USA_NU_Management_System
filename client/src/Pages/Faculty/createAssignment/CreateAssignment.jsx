import React, { useEffect, useRef, useState } from "react";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import useAuth from "../../../Components/Hooks/useAuth";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router";
import useFetchData from "../../../Components/Hooks/useFetchData";

const CreateAssignment = () => {
  const { id } = useParams();
  const { data } = id
    ? useFetchData(`${id}`, `/assignment/${id}`)
    : { data: null };
  const { user: faculty } = useAuth();
  const email = faculty?.email;
  const axiosInstance = AxiosSecure();

  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    instructions: "",
    file: null,
    deadline: "",
    semester: "",
  });
  const [allCourses, setAllCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (id && data) {
      setFormData({
        courseId: data?.courseId || "",
        title: data?.title || "",
        instructions: data?.instructions || "",
        file: null,
        deadline: data?.deadline || "",
        semester: data?.semester || "",
      });
    }
  }, [id, data]);

  useEffect(() => {
    const fetchCoursesByQuarter = async () => {
      if (formData.semester && email) {
        try {
          const res = await axiosInstance.get(
            `/faculty-assign/courses-by-quarter?email=${email}&semester=${formData.semester}`
          );
          setAllCourses(res.data || []);
        } catch (err) {
          console.error("Failed to fetch courses by quarter", err);
          setAllCourses([]);
        }
      }
    };
    fetchCoursesByQuarter();
  }, [formData.semester, email, axiosInstance]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { courseId, title, instructions, file, deadline, semester } =
      formData;
    if (
      !courseId ||
      !title ||
      !instructions ||
      (!file && !id) ||
      !deadline ||
      !semester
    ) {
      setError("All fields are required including the deadline and semester.");
      setLoading(false);
      return;
    }

    const deadlineDate = new Date(deadline);
    const now = new Date();
    if (deadlineDate < now) {
      setError("Deadline must be a future date and time.");
      setLoading(false);
      return;
    }

    const selectedCourse = allCourses.find(
      (c) => c._id.toString() === courseId.toString()
    );

    if (!selectedCourse) {
      setError("Selected course not found.");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("courseId", selectedCourse._id);
    data.append("courseCode", selectedCourse.courseId);
    data.append("title", title);
    data.append("instructions", instructions);
    data.append("file", file);
    data.append("email", user?.email);
    data.append("deadline", deadline);
    data.append("semester", semester);

    try {
      if (id) {
        const res = await axiosInstance.patch(
          `/update-assignment/${id}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (res?.data?.modifiedCount > 0) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Assignment has been Updated",
            showConfirmButton: false,
            timer: 1500,
          });
          setLoading(false);
          return navigate("/dashboard/assignment");
        }
      }
      const res = await axiosInstance.post("/upload-assignment", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.insertedId) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Assignment has been created",
          showConfirmButton: false,
          timer: 1500,
        });

        navigate("/dashboard/assignment");
        setFormData({
          courseId: "",
          title: "",
          instructions: "",
          file: null,
          deadline: "",
          semester: "",
        });
        if (fileInputRef.current) fileInputRef.current.value = null;
      }
    } catch (err) {
      console.error("Upload error:-->", err);
      Swal.fire("Error", "Failed to upload assignment", "error");
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-2">Create Assignment</h2>
        <p className="text-gray-600 mb-4">Enter assignment details below</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="label">
            <span className="label-text">Quarter *</span>
          </label>
          <select
            className="select select-bordered w-full"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
          >
            <option disabled value="">
              Select Quarter
            </option>
            {[...Array(16)].map((_, i) => (
              <option key={i + 1} value={`Quarter-${i + 1}`}>
                Quarter-{i + 1}
              </option>
            ))}
          </select>

          <label className="label">
            <span className="label-text">Select Course *</span>
          </label>
          <select
            className="select select-bordered w-full"
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            required
          >
            <option disabled value="">
              Select Course
            </option>
            {allCourses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="label">
            <span className="label-text">Assignment Title *</span>
          </label>
          <input
            type="text"
            name="title"
            className="input input-bordered w-full"
            placeholder="Enter title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label className="label">
            <span className="label-text">Instructions *</span>
          </label>
          <textarea
            name="instructions"
            className="textarea textarea-bordered w-full"
            rows="5"
            placeholder="Enter instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
          ></textarea>

          <label className="label">
            <span className="label-text">Deadline (Date & Time) *</span>
          </label>
          <input
            type="datetime-local"
            name="deadline"
            className="input input-bordered w-full"
            value={formData.deadline}
            onChange={handleChange}
            min={getCurrentDateTimeLocal()}
            required
          />

          <label className="label">
            <span className="label-text">Upload PDF *</span>
          </label>
          {formData?.file === null && data?.filename && (
            <div className="mb-2 text-sm text-gray-600">
              Current File:{" "}
              <a
                href={`http://localhost:3000/${data?.path?.replace(
                  /\\/g,
                  "/"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {data?.originalname || "View File"}
              </a>
            </div>
          )}
          <input
            type="file"
            name="file"
            className="file-input file-input-bordered w-full"
            accept=".pdf"
            onChange={handleChange}
            ref={fileInputRef}
          />

          {error && (
            <label className="label">
              <span className="text-red-600 font-medium">{error}</span>
            </label>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Create Assignment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;
