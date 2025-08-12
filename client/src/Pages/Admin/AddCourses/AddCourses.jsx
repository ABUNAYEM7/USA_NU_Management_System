import { useState } from "react";
import addCoursesImage from "../../../assets/addCourses.jpg";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import useFetchData from "../../../Components/Hooks/useFetchData";

const AddCourses = () => {
  const [formData, setFormData] = useState({
    courseId: "",
    name: "",
    credit: "",
    description: "",
    facultyEmail: "",
    semester: "",
    department: "",
    date: new Date().toISOString(),
  });

  const { data: faculties } = useFetchData("faculties", "/all-faculties");
  const axiosInstance = AxiosSecure();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      courseId,
      name,
      credit,
      description,
      facultyEmail,
      semester,
      department,
    } = formData;

    if (
      !courseId ||
      !name ||
      !credit ||
      !description ||
      !facultyEmail ||
      !semester ||
      !department
    ) {
      return Swal.fire({
        icon: "warning",
        title: "All fields are required",
        text: "Please fill out every field including department and semester.",
      });
    }

    if (parseFloat(credit) <= 0) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Credit Value",
        text: "Credit must be a positive number.",
      });
    }

    try {
      const res = await axiosInstance.post("/add-courses", formData);
      if (res?.data?.insertedId) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Course Added Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/dashboard/courses");
      }
    } catch (err) {
      Swal.fire({
        title: "Error Occurred",
        icon: "error",
        text: "Please try again.",
      });
    }
  };

  const BachelorProgram = [
    "Bachelor of Science in Business Administration",
    "Bachelor of Science in Civil Engineering",
    "Bachelor of Science in Computer Science",
    "Bachelor of Science in Information System Management",
    "Bachelor of Hospitality and Tourism Management",
  ];

  const Masters = [
    "Master of Health and Social Care Management",
    "Master of Science in Civil Engineering",
    "Master of Science in Business Administration",
    "Masters of Science in Information System Management",
    "Master of Hospitality and Tourism Management",
  ];

  const Doctorate = [
    "Doctor of Business Management",
    "Doctor of Health and Social Care Management",
    "Doctor of Science in Computer Science",
    "Doctor of Management",
    "Doctor of Hospitality and Tourism Management",
  ];

  const Associate = ["English as a Second Language"];

  return (
    <div className="mockup-window border border-base-300 w-full p-4 mt-6">
      <div className="flex gap-5 flex-col-reverse md:flex-row items-center">
        <div className="w-fit md:w-1/2">
          <img src={addCoursesImage} alt="Add courses" />
        </div>

        <div className="w-fit md:w-1/2 rounded-3xl">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-lg w-full"
          >
            <h2 className="text-xl font-bold text-center mb-4">
              Create Course
            </h2>

            {/* Semester Dropdown */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Quarter</span>
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Quarter</option>
                <option value="Quarter-1">Quarter-1</option>
                <option value="Quarter-2">Quarter-2</option>
                <option value="Quarter-3">Quarter-3</option>
                <option value="Quarter-4">Quarter-4</option>
                <option value="Quarter-5">Quarter-5</option>
                <option value="Quarter-6">Quarter-6</option>
                <option value="Quarter-7">Quarter-7</option>
                <option value="Quarter-8">Quarter-8</option>
                <option value="Quarter-9">Quarter-9</option>
                <option value="Quarter-10">Quarter-10</option>
                <option value="Quarter-11">Quarter-11</option>
                <option value="Quarter-12">Quarter-12</option>
                <option value="Quarter-13">Quarter-13</option>
                <option value="Quarter-14">Quarter-14</option>
                <option value="Quarter-15">Quarter-15</option>
                <option value="Quarter-16">Quarter-16</option>
              </select>
            </div>

            {/* Department Dropdown */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Department</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Department</option>

                <optgroup label="Bachelor Programs">
                  {BachelorProgram.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Master Programs">
                  {Masters.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Doctorate Programs">
                  {Doctorate.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Associate Programs">
                  {Associate.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Course ID */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Course ID</span>
              </label>
              <input
                type="input"
                name="courseId"
                onWheel={(e) => e.target.blur()}
                value={formData.courseId}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Course Name */}
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

            {/* Faculty Selection */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Assign Faculty</span>
              </label>
              <select
                name="facultyEmail"
                value={formData.facultyEmail}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Faculty</option>
                {faculties?.result?.map((faculty) => (
                  <option key={faculty._id} value={faculty.email}>
                    {faculty.firstName} {faculty.lastName} -{" "}
                    {faculty.department}
                  </option>
                ))}
              </select>

              {/* Preview Card */}
              {formData.facultyEmail &&
                (() => {
                  const selectedFaculty = faculties?.result?.find(
                    (f) => f.email === formData.facultyEmail
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
                          <strong>Department:</strong>{" "}
                          {selectedFaculty.department}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Designation:</strong>{" "}
                          {selectedFaculty.designation}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Email:</strong> {selectedFaculty.email}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Create
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourses;
