import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Swal from "sweetalert2";
import AxiosSecure from "../../Components/Hooks/AxiosSecure";

const ReviewEnrollReq = () => {
  const { id } = useParams();
  const axiosInstance = AxiosSecure();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (id) {
      axiosInstance
        .get(`/specific-user/${id}`)
        .then((res) => {
          setUserData(res.data);
          if (process.env.NODE_ENV === "development") {
            console.log("✅ User fetched:", res.data);
          }
        })
        .catch((err) => {
          if (process.env.NODE_ENV === "development") {
            console.error("❌ Failed to fetch user:", err);
          }
        });
    }
  }, [id, axiosInstance]);

  // ✅ Accept logic
  const handleAccept = async () => {
    try {
      if (userData) {
        const { email, name, photo } = userData;

        const updateRole = await axiosInstance.patch(`/update/user-role/${id}`, {
          role: "student",
          enrollRequest: false,
        });

        if (
          (updateRole?.data?.modifiedCount > 0 &&
            updateRole?.data?.matchedCount > 0) ||
          (updateRole?.data?.matchedCount > 0 &&
            updateRole?.data?.modifiedCount === 0)
        ) {
          const studentInfo = {
            email,
            name,
            photo,
            studentId : userData?.studentId,
            department: userData.department,
            city: userData.city,
            country: userData.country,
            currentAddress: userData.currentAddress,
            permanentAddress: userData.permanentAddress,
            gender: userData.gender,
          };

          const res = await axiosInstance.post(`/create-student`, studentInfo);

          if (res?.data?.insertedId) {
            Swal.fire({
              icon: "success",
              title: "Enrollment Accepted",
              timer: 1500,
              showConfirmButton: false,
            });
            navigate("/dashboard/manage-students");
          }
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Error accepting enrollment:", err);
      }
      Swal.fire({
        icon: "error",
        title: "Failed to accept enrollment",
        text: "Please try again later.",
      });
    }
  };

  // ❌ Deny logic
  const handleDeny = async () => {
    try {
      const res = await axiosInstance.patch(`/update/user-role/${id}`, {
        enrollRequest: false,
      });

      if (
        res.data.modifiedCount > 0 ||
        (res.data.matchedCount > 0 && res.data.modifiedCount === 0)
      ) {
        Swal.fire({
          icon: "success",
          title: "Enrollment Denied",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/dashboard/manage-users");
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Error denying enrollment:", err);
      }
      Swal.fire({
        icon: "error",
        title: "Failed to deny enrollment",
        text: "Please try again later.",
      });
    }
  };

  if (!userData) return <div className="text-center mt-20">Loading user data...</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto bg-base-100 rounded shadow mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-highlight">
        Review Enrollment Request
      </h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          "name",
          "email",
          "department",
          "city",
          "country",
          "currentAddress",
          "permanentAddress",
          "gender",
        ].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-600 capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="text"
              value={userData[field] || ""}
              className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-gray-300"
              readOnly
            />
          </div>
        ))}
      </form>

      <div className="flex justify-end gap-4 mt-8">
        <button onClick={handleAccept} className="btn btn-success">
          Accept
        </button>
        <button onClick={handleDeny} className="btn btn-error text-white">
          Deny
        </button>
      </div>
    </div>
  );
};

export default ReviewEnrollReq;
