import React, { useState, useEffect } from "react";
import useUserRole from "../Hooks/useUserRole";
import AxiosSecure from "../Hooks/AxiosSecure";
import Swal from "sweetalert2";

const StudentProfile = () => {
  const { data } = useUserRole();
  const student = data?.data;
  const [isEditable, setIsEditable] = useState(false);
  const [formData, setFormData] = useState({});
  const axiosInstance = AxiosSecure();

  useEffect(() => {
    if (student) {
      setFormData({
        gender: student.gender || "",
        countryCode: student.countryCode || "+1",
        contactNumber: student.contactNumber || "",
        currentAddress: student.currentAddress || "",
        permanentAddress: student.permanentAddress || "",
        city: student.city || "",
        country: student.country || "",
        bloodGroup: student.bloodGroup || "",
      });
    }
  }, [student]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleEdit = () => setIsEditable(!isEditable);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.patch(
        `/update/user-info/${student?.email}`,
        formData
      );

      const { success, userUpdate, secondaryUpdate } = res?.data;

      if (success && (userUpdate > 0 || secondaryUpdate > 0)) {
        setIsEditable(false);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Information Has Been Updated",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          position: "center",
          icon: "info",
          title: "No changes detected",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Update failed:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong during update!",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-base-100 shadow-xl rounded-3xl border border-gray-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Student Profile</h2>
        <button className="btn btn-secondary" onClick={toggleEdit}>
          {isEditable ? "Cancel" : "Edit"}
        </button>
      </div>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        onSubmit={handleSubmit}
      >
        {/* Left Column */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="avatar">
            <div className="w-48 rounded-full shadow-lg ring ring-primary ring-offset-4">
              <img
                referrerPolicy="no-referrer"
                src={student?.photo}
                alt="Student Avatar"
              />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-semibold">{student?.name}</h2>
            <p className="text-lg text-gray-500">{student?.email}</p>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="space-y-4">
          {["city", "country", "currentAddress", "permanentAddress"].map(
            (field) => (
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
                  className={`w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border ${
                    isEditable
                      ? "border-primary shadow-sm"
                      : "border-transparent"
                  } focus:outline-none`}
                  readOnly={!isEditable}
                  required
                />
              </div>
            )
          )}

          {/* Gender Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border ${
                isEditable ? "border-primary shadow-sm" : "border-transparent"
              } focus:outline-none`}
              disabled={!isEditable}
              required
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Blood Group Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className={`w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border ${
                isEditable ? "border-primary shadow-sm" : "border-transparent"
              } focus:outline-none`}
              disabled={!isEditable}
              required
            >
              <option value="" disabled>
                Select Blood Group
              </option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Number with Country Code */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Contact Number
            </label>
            <div className="flex gap-2">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className={`mt-1 px-4 py-2 bg-base-200 rounded-lg border ${
                  isEditable ? "border-primary shadow-sm" : "border-transparent"
                } focus:outline-none`}
                disabled={!isEditable}
                required
              >
                <option value="+1">+1 (USA)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+91">+91 (India)</option>
                <option value="+880">+880 (Bangladesh)</option>
                <option value="+971">+971 (UAE)</option>
              </select>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter Contact Number"
                className={`flex-1 mt-1 px-4 py-2 bg-base-200 rounded-lg border ${
                  isEditable ? "border-primary shadow-sm" : "border-transparent"
                } focus:outline-none`}
                readOnly={!isEditable}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full ${isEditable ? "" : "hidden"}`}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;
