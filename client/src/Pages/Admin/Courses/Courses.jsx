import React, { useEffect, useState } from "react";
import useAuth from "../../../Components/Hooks/useAuth";
import Swal from "sweetalert2";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import { Link, useNavigate } from "react-router";

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

const Courses = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const axiosInstance = AxiosSecure();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedDepartment) {
      fetchCoursesByDepartment(selectedDepartment, page);
    }
  }, [selectedDepartment, page]);

  const fetchCoursesByDepartment = async (department, currentPage) => {
    try {
      const res = await axiosInstance.get(
        `/all-courses-by-department?department=${encodeURIComponent(
          department
        )}&page=${currentPage}&limit=${limit}`
      );
      setCourses(res.data?.courses || []);
      setTotalPages(Math.ceil(res.data?.total / limit));
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const deleteHandler = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await axiosInstance.delete(`/delete-course/${id}`);
        if (res?.data?.deletedCount > 0) {
          fetchCoursesByDepartment(selectedDepartment, page);
          Swal.fire("Deleted!", "Course has been deleted.", "success");
        }
      }
    });
  };

  const updateHandler = (id) => {
    navigate(`/edit-course/${id}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div>
      <h3 className="text-3xl font-black text-center mt-6">
        Course Management
      </h3>

      <div className="mt-6 p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <select
          className="select select-bordered w-full max-w-sm"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="" disabled>
            Select Department
          </option>
          <optgroup label="Bachelor Programs">
            {BachelorProgram.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </optgroup>
          <optgroup label="Masters Programs">
            {Masters.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </optgroup>
          <optgroup label="Doctorate Programs">
            {Doctorate.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </optgroup>
          <optgroup label="Associate Programs">
            {Associate.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </optgroup>
        </select>

        <Link
          to={"/dashboard/add-courses"}
          className="btn uppercase hover:bg-green-400 hover:text-white"
        >
          Add Courses ➕
        </Link>
      </div>

      <div className="mt-6 p-2 max-w-full md:max-w-[90%] lg:max-w-full  mx-auto">
        {courses.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Course ID</th>
                    <th>Name</th>
                    <th>Credit</th>
                    <th>Description</th>
                    <th>Create At</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, i) => (
                    <tr key={c?._id} className="bg-base-200">
                      <th>{(page - 1) * limit + i + 1}</th>
                      <td>{c?.courseId}</td>
                      <td>{c?.name}</td>
                      <td>{c?.credit}</td>
                      <td>{c?.description}</td>
                      <td>{c?.date?.split("T")[0]}</td>
                      <td>
                        <div className="dropdown dropdown-start">
                          <div tabIndex={0} role="button" className="btn m-1">
                            Click ⬇️
                          </div>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-100 rounded-box z-1 w-30 p-2 shadow-sm"
                          >
                            <li>
                              <button onClick={() => updateHandler(c?._id)}>
                                Update
                              </button>
                            </li>
                            <li>
                              <button onClick={() => deleteHandler(c?._id)}>
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`btn btn-sm ${
                    page === i + 1 ? "btn-primary" : "btn-outline"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        ) : (
          selectedDepartment && (
            <p className="text-center mt-6 text-red-500 font-semibold">
              No courses found for selected department.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default Courses;
