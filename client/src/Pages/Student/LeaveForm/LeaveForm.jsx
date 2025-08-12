import React, { useState } from "react";
import useAuth from "../../../Components/Hooks/useAuth";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import StudentsLeaveRequest from "../../../Components/StudnetsLeaveRequest/StudentsLeaveRequest";

const LeaveForm = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const axiosInstance = AxiosSecure()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    applicationDate : new Date().toISOString(),
    status : 'pending'
  });

  const [error, setError] = useState("");

  // handleChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  // validate
  const validate = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const currentDate = new Date(today);

    if (start < currentDate) {
      setError("Start date cannot be in the past.");
      return false;
    }

    if (end < start) {
      setError("End date cannot be before start date.");
      return false;
    }

    setError("");
    return true;
  };

  // handleSubmit
  const handleSubmit =async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {...formData}
    try{
      const res =await axiosInstance.post('/leave-application',data)
    if(res?.data?.insertedId){
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Your Application has been submitted",
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/dashboard/attendance')
    }
    }
    catch(err){
      setError(err.message || err.code || 'Error Occur Please Try Again Later')
    }
  };

  return (
    <div className="p-6 w-full ">
      <div className="bg-white rounded-2xl shadow p-6 md:max-w-[80%] mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Student Leave Application Form
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label font-semibold">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              readOnly
            />
          </div>

          <div className="form-control">
            <label className="label font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              readOnly
            />
          </div>

          <div className="form-control">
            <label className="label font-semibold">Leave Type</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="" disabled>
                Select Leave Type
              </option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Personal Leave">Personal Leave</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label font-semibold">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              min={today}
            />
          </div>

          <div className="form-control">
            <label className="label font-semibold">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              min={formData.startDate || today}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}

          <div className="form-control">
            <label className="label font-semibold">Reason for Leave</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              rows="4"
              required
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="btn bg-orange-600 text-white w-full"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
      <StudentsLeaveRequest/>
    </div>
  );
};

export default LeaveForm;
