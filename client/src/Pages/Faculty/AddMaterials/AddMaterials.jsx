import React, { useState, useEffect } from "react";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import useAuth from "../../../Components/Hooks/useAuth";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router";

const AddMaterials = () => {
  const axiosInstance = AxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

const [departments] = useState([
    "Bachelor of Science in Business Administration",
    "Bachelor of Science in Civil Engineering",
    "Bachelor of Science in Computer Science",
    "Bachelor of Science in Information System Management",
    "Bachelor of Hospitality and Tourism Management",
    "Master of Health and Social Care Management",
    "Master of Science in Civil Engineering",
    "Master of Science in Business Administration",
    "Masters of Science in Information System Management",
    "Master of Hospitality and Tourism Management",
    "Doctor of Business Management",
    "Doctor of Health and Social Care Management",
    "Doctor of Science in Computer Science",
    "Doctor of Management",
    "Doctor of Hospitality and Tourism Management",
    "English as a Second Language",
  ]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departmentCourses, setDepartmentCourses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ added
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    email: "",
    file: null,
    existingFileUrl: "",
  });

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    if (!selectedDepartment) return;
    const fetchCourses = async () => {
      try {
        const res = await axiosInstance.get(
          `/all-courses-by-department?department=${encodeURIComponent(selectedDepartment)}`
        );
        setDepartmentCourses(Array.isArray(res.data.courses) ? res.data.courses : []);
      } catch (err) {
        console.error("Error fetching courses by department:", err);
        setDepartmentCourses([]);
      }
    };
    fetchCourses();
  }, [selectedDepartment]);

  useEffect(() => {
    if (!id) return;
    const fetchMaterial = async () => {
      try {
        const res = await axiosInstance.get(`/material/${id}`);
        const data = res.data;
        setSelectedDepartment(data.department || "");
        setFormData({
          title: data.title,
          courseId: data.courseId,
          email: data.email,
          file: null,
          existingFileUrl: `/files/${data.filename}`,
        });
      } catch (err) {
        console.error("Failed to fetch material for edit:", err);
      }
    };
    fetchMaterial();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // ✅ disable on submit

    const form = new FormData();
    form.append("title", formData.title);
    form.append("courseId", formData.courseId);
    form.append("email", formData.email);
    form.append("department", selectedDepartment);
    if (formData.file) {
      form.append("file", formData.file);
    }

    try {
      if (id) {
        await axiosInstance.patch(`/update-material/${id}`, form);
        Swal.fire("Updated!", "Material updated successfully.", "success");
      } else {
        await axiosInstance.post("/upload-file", form);
        Swal.fire("Uploaded!", "Material uploaded successfully.", "success");
      }
      navigate("/dashboard/materials");
    } catch (err) {
      console.error("Submit failed:", err);
      Swal.fire("Error!", "Something went wrong.", "error");
    } finally {
      setIsSubmitting(false); // ✅ re-enable after request
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {id ? "Update Course Material" : "Upload Course Material"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Select Department</label>
          <select
            className="select select-bordered w-full"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setFormData((prev) => ({ ...prev, courseId: "" }));
            }}
          >
            <option value="" disabled>
              Choose Department
            </option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Select Course</label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className="select select-bordered w-full"
            disabled={!selectedDepartment}
          >
            <option value="" disabled>
              Choose Course
            </option>
            {Array.isArray(departmentCourses) &&
              departmentCourses.map((course) => (
                <option key={course._id} value={course.courseId}>
                  {course.name} - {course.courseId}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Material Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
          />
        </div>

        {id && formData.existingFileUrl && (
          <div>
            <label className="block mb-1">Existing File</label>
            <a
              href={formData.existingFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Current PDF
            </a>
          </div>
        )}

        <div>
          <label className="block mb-1">Upload File (PDF only)</label>
          <input
            type="file"
            name="file"
            accept="application/pdf"
            onChange={handleChange}
            className="file-input file-input-bordered w-full"
            required={!id}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting} // ✅ apply disable
        >
          {isSubmitting
            ? id
              ? "Updating..."
              : "Uploading..."
            : id
            ? "Update Material"
            : "Upload Material"}
        </button>
      </form>
    </div>
  );
};

export default AddMaterials;
