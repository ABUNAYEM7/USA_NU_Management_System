import React, { useState } from "react";
import Swal from "sweetalert2";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import useAuth from "../../../Components/Hooks/useAuth";

const ManualStudentPaymentForm = ({ email, studentId, name }) => {
  const axiosInstance = AxiosSecure();
  const { user } = useAuth();
  const adminEmail = user?.email;

  const [formData, setFormData] = useState({
    subject: "",
    amount: "",
    status: "",
  });

  const subjects = [
    "Visa Processing",
    "Tuition Fee",
    "Accommodation",
    "Flight Ticket",
    "Other",
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.amount || !formData.status) {
      return Swal.fire({
        icon: "warning",
        title: "Incomplete",
        text: "All fields are required!",
      });
    }

    try {
      const response = await axiosInstance.post("/manual-payment-entry", {
        studentId,
        email,
        name,
        ...formData,
        amount: parseFloat(formData.amount),
        recordedBy: adminEmail,
      });

      if (response.data?.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Payment record added successfully!",
        });

        setFormData({
          subject: "",
          amount: "",
          status: "",
        });
      } else {
        throw new Error("Insert failed");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to record payment.",
      });

      if (import.meta.env.MODE === "production") {
        console.error(err); // Show in production only
      }
    }
  };

  return (
    <div className="mt-10 p-6 bg-white border border-gray-200 rounded-xl shadow-md max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Manual Payment Entry</h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-semibold text-gray-700">Student Name</label>
          <input
            type="text"
            value={name}
            readOnly
            className="input input-bordered w-full bg-white border-gray-300 text-gray-800 font-medium"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-semibold text-gray-700">Student Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="input input-bordered w-full bg-white border-gray-300 text-gray-800 font-medium"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">Payment Subject</label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">Amount (usd)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            required
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="">-- Select Status --</option>
            <option value="paid">Paid</option>
            <option value="due">Due</option>
          </select>
        </div>

        <div className="md:col-span-2 text-right">
          <button type="submit" className="btn btn-primary px-6">
            Submit Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualStudentPaymentForm;
