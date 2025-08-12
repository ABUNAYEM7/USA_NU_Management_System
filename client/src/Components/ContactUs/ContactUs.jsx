import Lottie from "lottie-react";
import React, { useState } from "react";
import Swal from "sweetalert2";
import contactAnimation from "../../../public/contactAnimation.json";
import AxiosSecure from "../Hooks/AxiosSecure";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const axiosInstance = AxiosSecure();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, phone, message } = formData;

    if (!name || !email || !phone || !message) {
      return Swal.fire({
        icon: "warning",
        title: "All fields are required",
        text: "Please fill out all fields before submitting.",
      });
    }

    try {
      const res = await axiosInstance.post("/send-email", formData);
      if (res?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Message Sent",
          text: res.data.message,
        });
        setFormData({ name: "", email: "", phone: "", message: "" });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to Send",
        text: error.response?.data?.error || "Something went wrong.",
      });
    }
  };

  return (
    <div>
      <h3 className="text-highlight text-3xl md:text-4 lg:text-5xl font-black text-center">
        Contact Us
      </h3>
      <p className="text-sm font-medium w-11/12 md:w-2/3 mx-auto text-center mt-3">
        We're here to help! Reach out to us anytime with your questions, feedback, or inquiries. Our dedicated support team is ready to assist you and will respond as quickly as possible.
      </p>
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 my-12">
        <div className="w-full md:w-1/2">
          <Lottie
            style={{ height: "300px", width: "100%" }}
            animationData={contactAnimation}
            loop={true}
          />
        </div>
        {/* form-container */}
        <div className="w-full md:w-1/2 rounded-3xl shadow-md">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <fieldset className="fieldset">
                {/* Name */}
                <div className="mt-3">
                  <label className="fieldset-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input w-full"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Email */}
                <div className="mt-3">
                  <label className="fieldset-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input w-full"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Phone Number */}
                <div className="mt-3">
                  <label className="fieldset-label">Phone No</label>
                  <input
                    type="text"
                    name="phone"
                    className="input w-full"
                    placeholder="Phone No"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Message */}
                <div className="mt-3">
                  <label className="fieldset-label">Message</label>
                  <textarea
                    name="message"
                    className="textarea h-24 w-full"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-neutral mt-4">
                  Send
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
