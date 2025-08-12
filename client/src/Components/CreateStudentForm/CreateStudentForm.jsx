import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import useFetchData from "../Hooks/useFetchData";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";
import AxiosSecure from "../Hooks/AxiosSecure";

const CreateStudentForm = () => {
  const [formData, setFormData] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosInstance = AxiosSecure();

  const { data: user, refetch } = useFetchData(`${id}`, `/specific-user/${id}`);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        const { email, name, photo } = user;
        const department = formData.department;
        if (!department) {
          return Swal.fire("Error", "Please select a department", "error");
        }

        const prefix = department
          .replace(/[^A-Za-z]/g, "")
          .substring(0, 2)
          .toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const uniquePart = `${Date.now().toString().slice(-5)}${randomNum}`;
        const studentId = `${prefix}${uniquePart}`;

        const updateRole = await axiosInstance.patch(
          `/update/user-role/${id}`,
          {
            role: "student",
          }
        );

        if (
          (updateRole?.data?.modifiedCount > 0 &&
            updateRole?.data?.matchedCount > 0) ||
          (updateRole?.data?.modifiedCount === 0 &&
            updateRole?.data?.matchedCount > 0)
        ) {
          const studentInfo = {
            email,
            name,
            photo,
            studentId,
            createdAt: new Date().toISOString(),
            ...formData,
          };
          const res = await axiosInstance.post(`/create-student`, studentInfo);

          if (res?.data?.insertedId) {
            Swal.fire({
              position: "center",
              icon: "success",
              title: `Student Created: ID ${studentId}`,
              showConfirmButton: false,
              timer: 1800,
            });
            refetch();
            navigate("/dashboard/manage-students");
          }
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="p-12 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
      >
        <FaArrowLeft /> Back
      </button>
      <h2 className="text-2xl font-bold mb-10 text-center">
        Create Student Form
      </h2>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Name
          </label>
          <input
            type="text"
            value={user?.name || ""}
            className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            type="email"
            value={user?.email || ""}
            className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
            readOnly
          />
        </div>

        <div className="form-control">
          <label className="block text-sm font-medium text-gray-600">
            Department
          </label>
          <select
            name="department"
            value={formData.department || ""}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
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

        {["city", "country", "currentAddress", "permanentAddress"].map(
          (field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-600 capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                name={field}
                value={formData[field] || ""}
                onChange={handleChange}
                placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
                className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
                required
              />
            </div>
          )
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 capitalize">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn bg-[#0056b3] text-white w-full col-span-2"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default CreateStudentForm;
