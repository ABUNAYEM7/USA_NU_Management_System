import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import Swal from "sweetalert2";
import AxiosSecure from "../Components/Hooks/AxiosSecure";
import useAuth from "../Components/Hooks/useAuth";
import useUserRole from "../Components/Hooks/useUserRole";

const Enroll = () => {
  const { user } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const axiosInstance = AxiosSecure();
  const { data } = useUserRole();
  const userRole = data?.data?.role;

  const [formData, setFormData] = useState({
    city: "",
    country: "",
    currentAddress: "",
    permanentAddress: "",
    gender: "",
    enrollRequest: true,
  });
  const [submitting,setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (submitting) return; // Prevent extra clicks
  setSubmitting(true);

  if (userRole === "faculty" || userRole === "admin") {
    setSubmitting(false);
    return Swal.fire({
      icon: "warning",
      title: "Access Denied",
      text: "Faculty and Admins are not allowed to enroll as students.",
    });
  }

  const department = state?.program;
  if (!department) {
    setSubmitting(false);
    return Swal.fire("Error", "Program info is missing", "error");
  }

  const prefix = department.replace(/[^A-Za-z]/g, "").substring(0, 2).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const uniquePart = `${Date.now().toString().slice(-5)}${randomNum}`;
  const studentId = `${prefix}${uniquePart}`;

  const payload = {
    ...formData,
    email: user?.email,
    name: user?.displayName,
    photo: user?.photoURL || "",
    department,
    studentId,
  };

  try {
    const res = await axiosInstance.patch(`/update/user-info/${user.email}`, payload);

    if (res.data?.modifiedCount > 0) {
      Swal.fire({
        icon: "success",
        title: "Enrollment Submitted",
        text: `You have requested to enroll in ${department}. Your Student ID is ${studentId}`,
      });
      navigate("/");
    } else {
      Swal.fire({
        icon: "info",
        title: "No Changes Made",
        text: "It seems you're already enrolled or no updates were needed.",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Submission Failed",
      text: "Something went wrong. Please try again later.",
    });
  } finally {
    setSubmitting(false); // ✅ Re-enable the button after request completes
  }
};


  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full sm:max-w-2xl md:max-w-3xl mx-auto mt-20 bg-base-100 rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center text-highlight">
        Enrollment Form
      </h1>

      {(userRole === "faculty" || userRole === "admin") && (
        <div className="text-center text-red-500 font-semibold mb-6">
          You are not allowed to submit the enrollment form.
        </div>
      )}

      <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-600">Name</label>
          <input
            type="text"
            value={user?.displayName || ""}
            className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Department</label>
          <input
            type="text"
            value={state?.program || ""}
            className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
            readOnly
          />
        </div>

        {["city", "country", "currentAddress", "permanentAddress"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-600 capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
              className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
              required
              disabled={userRole === "faculty" || userRole === "admin"}
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-600 capitalize">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
            required
            disabled={userRole === "faculty" || userRole === "admin"}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn bg-[#0056b3] text-white w-full"
          disabled={submitting || userRole === "faculty" || userRole === "admin"}
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default Enroll;
