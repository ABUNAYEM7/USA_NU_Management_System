import React, { useState } from "react";
import { getImageUrl } from "../../../utility/getImageUrl";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import useFetchData from "../../../Components/Hooks/useFetchData";

const AddFaculty = () => {
  const [isSubmitting,setIsSubmitting] = useState(false)
    const { data } = useFetchData(
        "faculties",
        "/all-faculties"
      )
      const totalStaff = data?.totalStaff
  const [formData, setFormData] = useState({
    staffNo: totalStaff +1,
    role: "",
    designation: "",
    firstName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    email: "",
    gender: "",
    dob: "",
    doj: "2025-03-25",
    mobile: "",
    staffPhoto: null,
    currentAddress: "",
    permanentAddress: "",
  });

  const axiosInstance = AxiosSecure()
  const navigate = useNavigate()

//   handleChange
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

//   handle submit
const handleSubmit = async (e) => {
  e.preventDefault();

  let finalData = { ...formData };

  if (formData?.staffPhoto) {
    try {
      setIsSubmitting(true);
      const imgFormData = new FormData();
      imgFormData.append("image", formData.staffPhoto);

      const photoUrl = await getImageUrl(imgFormData);
      finalData.staffPhoto = photoUrl;
      
      const res = await axiosInstance.post('/add-faculty', finalData);
      if(res?.data?.insertedId){
        navigate('/dashboard/manage-faculty');
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Faculty has been saved",
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (err) {
      console.error("Image upload failed", err);
    } finally {
      setIsSubmitting(false); 
    }
  }
};

  return (
    <div className="p-6">
        <h3 className="text-xl md:text-3xl font-black mt-3 uppercase text-center">Add Staff</h3>
      <div className="shadow-md p-6 bg-white rounded-lg max-w-6xl mx-auto mt-12">
      <h3 className="text-xl md:text-2xl font-medium mt-3 uppercase mb-3">Staff Information</h3>
      <form
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-semibold mb-1">Staff No *</label>
          <input
            name="staffNo"
            value={formData.staffNo}
            onChange={handleChange}
            type="number"
            placeholder="10"
            className="input input-bordered w-full"
            required
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Role *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option disabled value="">Role *</option>
            <option>Admin</option>
            <option>Faculty</option>
            <option>Staff</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Designation</label>
          <select
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option disabled value="">Designations</option>
            <option>Professor</option>
            <option>Assistant</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">First Name *</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            type="text"
            placeholder="First Name"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Last Name</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            type="text"
            placeholder="Last Name"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Father Name</label>
          <input
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            type="text"
            placeholder="Father Name"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Mother Name</label>
          <input
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            type="text"
            placeholder="Mother Name"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Email *</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Gender *</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option disabled value="">Gender *</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Date of Birth</label>
          <input
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            type="date"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Date of Joining</label>
          <input
            name="doj"
            value={formData.doj}
            onChange={handleChange}
            type="date"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Mobile</label>
          <input
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            type="number"
            placeholder="Mobile Number"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="col-span-1 md:col-span-3">
          <label className="block text-sm font-semibold mb-1">Staff Photo</label>
          <input
            name="staffPhoto"
            type="file"
            onChange={handleChange}
            accept="image/png, image/jpeg, image/jpg"
            className="file-input file-input-bordered w-full"
            required
          />
          <p className="text-xs text-purple-500 mt-1">
            (JPG, JPEG, PNG are allowed for upload)
          </p>
        </div>

        <div className="col-span-1 md:col-span-3">
          <label className="block text-sm font-semibold mb-1">Current Address</label>
          <input
            name="currentAddress"
            value={formData.currentAddress}
            onChange={handleChange}
            type="text"
            placeholder="Current Address"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="col-span-1 md:col-span-3">
          <label className="block text-sm font-semibold mb-1">Permanent Address</label>
          <input
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleChange}
            type="text"
            placeholder="Permanent Address"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="col-span-1 md:col-span-3 mt-4">
          <button 
          disabled={isSubmitting}
          type="submit" className="btn btn-primary w-full">
            {isSubmitting ? 'Submitting' : 'Submit'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default AddFaculty;