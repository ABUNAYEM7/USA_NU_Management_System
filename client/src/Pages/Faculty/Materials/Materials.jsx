import React from "react";
import { Link } from "react-router";
import useFetchData from "../../../Components/Hooks/useFetchData";
import useAuth from "../../../Components/Hooks/useAuth";
import Swal from "sweetalert2";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";

const Materials = () => {
  const { user } = useAuth();
  const axiosInstance = AxiosSecure();
  const { data, refetch } = useFetchData(
    `${user?.email}`,
    `/materials/${user?.email}`
  );

  // deleteHandler
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
        const res = await axiosInstance.delete(`/delete-material/${id}`);
        if (res?.data?.deletedCount > 0) {
          refetch();
          Swal.fire({
            title: "Deleted!",
            text: "Material has been deleted.",
            icon: "success",
          });
        }
      }
    });
  };

  console.log(data?.materials);

  return (
    <div>
      <div className="mt-3 p-2 md:p-4 flex items-center justify-between">
        <h3 className="text-lg md:text-2xl font-medium">Material Management</h3>
        <Link
          to={"/dashboard/add-materials"}
          className="btn btn-sm md:btn-md uppercase hover:bg-green-400 hover:text-white"
        >
          Add Material ➕
        </Link>
      </div>
      <div className="mt-12 overflow-x-auto sm:max-w-full max-w-[90vw] border rounded shadow bg-white">
        <table className="table w-full min-w-[600px]">
          <thead className="bg-gray-100">
            <tr>
              <th>#</th>
              <th>Course ID</th>
              <th>Title</th>
              <th>File</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data?.materials?.length > 0 ? (
              data.materials.map((material, i) => (
                <tr key={material._id}>
                  <td>{i + 1}</td>
                  <td>{material.courseId}</td>
                  <td>{material.title}</td>
                  <td>
                    {material?.firebaseUrl ? (
                      <a
                        href={material.firebaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400">No File</span>
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/dashboard/add-materials/${material._id}`}
                      className="btn btn-sm bg-green-500 text-white"
                    >
                      Edit
                    </Link>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteHandler(material._id)}
                      className="btn btn-sm bg-red-500 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 text-red-500">
                  No materials uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Materials;
