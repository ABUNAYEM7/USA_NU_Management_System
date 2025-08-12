import React, { useEffect, useState } from "react";
import useAuth from "../../Components/Hooks/useAuth";
import AxiosSecure from "../../Components/Hooks/AxiosSecure";

const StudentsMaterials = () => {
  const { user } = useAuth();
  const axiosInstance = AxiosSecure();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    const fetchStudentAndMaterials = async () => {
      if (!user?.email) return;

      try {
        // Step 1: Fetch student info
        const studentRes = await axiosInstance.get(`/student/${user.email}`);
        const student = studentRes.data;
        setStudentInfo(student);

        if (!student?.department) {
          console.error("❌ Student department not found");
          setLoading(false);
          return;
        }

        // Step 2: Fetch materials by department
        const materialsRes = await axiosInstance.get(
          `/materials-by-department?department=${student.department}`
        );
        setMaterials(materialsRes.data || []);
      } catch (error) {
        console.error("❌ Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndMaterials();
  }, [user?.email, axiosInstance]);

  if (loading) {
    return <p className="text-center py-6">Loading materials...</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Study Materials for {studentInfo?.department}
      </h2>
      {materials?.length === 0 ? (
        <p>No materials found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Course ID</th>
                <th className="px-4 py-2 border">Uploaded By</th>
                <th className="px-4 py-2 border">View</th>
              </tr>
            </thead>
            <tbody>
              {materials?.map((material) => (
                <tr key={material._id}>
                  <td className="px-4 py-2 border">{material.title}</td>
                  <td className="px-4 py-2 border">{material.courseId}</td>
                  <td className="px-4 py-2 border">{material.email}</td>
                  <td className="px-4 py-2 border">
                    <a
                      href={`http://localhost:3000/files/${material.filename.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline"
                    >
                      View Material
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentsMaterials;
