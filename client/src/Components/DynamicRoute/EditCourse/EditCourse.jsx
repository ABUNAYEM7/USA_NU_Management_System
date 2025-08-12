import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useFetchData from "../../Hooks/useFetchData";
import Swal from "sweetalert2";
import AxiosSecure from "../../Hooks/AxiosSecure";

const EditCourse = () => {
  const { id } = useParams();
  const { data } = useFetchData(`${id}`, `/courses/${id}`);
  const { data:facultyData} = useFetchData("faculties", "/all-faculties");
  const faculties = facultyData?.result;

  const [formData, setFormData] = useState({
    course: "",
    name: "",
    credit: "",
    description: "",
    date: "",
    facultyEmail: "",
  });

  const axiosInstance = AxiosSecure();
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      setFormData({
        course: data.courseId || "",
        name: data.name || "",
        credit: data.credit || "",
        description: data.description || "",
        date: data.date || "",
        facultyEmail: data.facultyEmail || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        courseId: formData.course,
        name: formData.name,
        credit: formData.credit,
        description: formData.description,
        facultyEmail: formData.facultyEmail,
        date: formData.date,
      };

      const res = await axiosInstance.patch(`/update-course/${id}`, payload);

      if (res?.data?.matchedCount > 0) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Course Updated Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/dashboard/courses");
      }
    } catch (err) {
      Swal.fire({
        title: "Error occurred",
        icon: "error",
        text: "Please try again",
      });
    }
  };

  return (
    <div>
      <h3 className="text-3xl font-black text-center mt-6">Edit Course</h3>
      <div className="w-fit md:w-2/3 mx-auto rounded-3xl mt-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-lg w-full"
        >
          {/* Course ID */}
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Course Id</span>
            </label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Name */}
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Course Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Credit */}
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Credit</span>
            </label>
            <input
              type="number"
              name="credit"
              value={formData.credit}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Description */}
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              required
            ></textarea>
          </div>

          {/* Faculty Dropdown */}
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Assigned Faculty</span>
            </label>
            <select
              name="facultyEmail"
              value={formData.facultyEmail}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="" disabled>
                Select Faculty
              </option>
              {faculties?.map((faculty) => (
                <option key={faculty._id} value={faculty.email}>
                  {faculty.firstName} {faculty.lastName} - {faculty.department}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Preview */}
          {formData.facultyEmail && (() => {
            const selectedFaculty = faculties?.find(
              (faculty) => faculty.email === formData.facultyEmail
            );
            return selectedFaculty ? (
              <div className="card shadow-md mt-4 border p-4 flex flex-col md:flex-row items-center gap-4 bg-gray-50">
                <img
                  src={selectedFaculty.staffPhoto}
                  alt="faculty"
                  className="w-24 h-24 rounded-full object-cover border"
                />
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedFaculty.firstName} {selectedFaculty.lastName}
                  </h3>
                  <p className="text-sm text-gray-700">
                    <strong>Department:</strong> {selectedFaculty.department}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Designation:</strong> {selectedFaculty.designation}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Email:</strong> {selectedFaculty.email}
                  </p>
                </div>
              </div>
            ) : null;
          })()}

          <button type="submit" className="btn btn-primary w-full">
            Update Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
