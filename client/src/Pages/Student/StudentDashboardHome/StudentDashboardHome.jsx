import React, { useEffect, useState } from "react";
import useUserRole from "../../../Components/Hooks/useUserRole";
import StudentsProfileStats from "../../../Components/StudentsState/StudentsProfileStats";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import { Link, useNavigate } from "react-router";

const StudentDashboardHome = () => {
  const { data: user } = useUserRole();
  const axiosInstance = AxiosSecure();

  const [studentInfo, setStudentInfo] = useState(null);
  const [courseOutline, setCourseOutline] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    attendance: 0,
    grades: 0,
    courses: 0,
  });

  const navigate = useNavigate()

  useEffect(() => {
    const fetchStudentInfo = async () => {
      if (user?.data?.email) {
        try {
          const res = await axiosInstance.get(`/student/${user.data.email}`);
          setStudentInfo(res.data);
        } catch (err) {
          console.error("❌ Error fetching student info:", err);
        }
      }
    };
    fetchStudentInfo();
  }, [user, axiosInstance]);

  useEffect(() => {
    const fetchCourseOutline = async () => {
      if (studentInfo?.department) {
        try {
          const res = await axiosInstance.get(
            `/course-distribution/${encodeURIComponent(studentInfo.department)}`
          );
          setCourseOutline(res.data);
        } catch (err) {
          console.error("❌ Error fetching course distribution:", err);
        }
      }
    };
    fetchCourseOutline();
  }, [studentInfo, axiosInstance]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (user?.data?.email) {
        try {
          const res = await axiosInstance.get(
            `/student-dashboard-state/${user?.data?.email}`
          );
          const {
            attendancePercentage,
            gradePercentage,
            enrollmentPercentage,
          } = res.data;

          setDashboardStats({
            attendance: attendancePercentage,
            grades: gradePercentage,
            courses: enrollmentPercentage,
          });
        } catch (err) {
          console.error("❌ Error fetching dashboard stats:", err);
        }
      }
    };

    fetchDashboardStats();
  }, [user, axiosInstance]);

const programFolders = [
    {
      name: "Bachelor of Science in Business Administration",
      link: "https://drive.google.com/drive/folders/1KPU32Ly-5YGZdq_B0HAbfnSUkUhOGy-w",
      bookLinks:
        "https://drive.google.com/drive/folders/1qVDYiHrf5KQRJMLh0PTyfQQUdxhp6giw", // allBooks_BSBA
    },
    {
      name: "Bachelor of Science in Civil Engineering",
      link: "https://drive.google.com/drive/folders/1oEifztyOnywT3_kIrtf5CxHXT51e9MSh",
      bookLinks:
        "https://drive.google.com/drive/folders/19SxxfqEQmMmrH1NQmwv3nhLBnnxvCcDX", // allBooks_BSc Civil
    },
    {
      name: "Bachelor of Science in Information System Management",
      link: "https://drive.google.com/drive/folders/1J7o9r934AUUBHm-JJ2PREXhj7-wj5Us8",
      bookLinks:
        "https://drive.google.com/drive/folders/18Y7memRBRpAZcxJQrczyt2SHmG8croQD", // allBooks_BScIS
    },
    {
      name: "Bachelor of Science in Computer Science",
      link: "https://drive.google.com/drive/folders/1c9Wm-56wHoEsZj7o4_Zq-409P2PeiGru",
      bookLinks:
        "https://drive.google.com/drive/folders/1I63u2mDWOkDGwQe8gicFWxaGpEcMnqlp", // allBooks_BSCS
    },
    {
      name: "Bachelor of Health and Social Care Management",
      link: "https://drive.google.com/drive/folders/1_RlAq1jke91E9w8wzRVLXnf_jZmBqjWr",
      bookLinks:
        "https://drive.google.com/drive/folders/1qpcXpjchE_z1ajqnDFJCpP8Vsjcahsj7", // allBooks_BSPH
    },
    {
      name: "Diploma in Business Management",
      link: "https://drive.google.com/drive/folders/1L4w0J8BtLdqw9QRZW48bU3wG0zwdNO2j",
      bookLinks:
        "https://drive.google.com/drive/folders/17fncbw3Q6Ezp8xBNoKMHmrEYfi97xHVI", // allBooks_DBM
    },
    {
      name: "Doctor of Management",
      link: "https://drive.google.com/drive/folders/1xLbTWuSxhz8N-JHSC9SsqQYbW8oUUfkh",
      bookLinks:
        "https://drive.google.com/drive/folders/1JERaU9in1R9lmUk4elL0CUmNxfftAKhC", // allBooks_Doctor of Management
    },
    {
      name: "Doctor of Health and Social Care Management",
      link: "https://drive.google.com/drive/folders/1z23Q7ip8IBXzaU01FAs26xufvPd4yBCA",
      bookLinks:
        "https://drive.google.com/drive/folders/1tszARKATc3JSm6ZPb7mo4P4ICkF0j4OO", // allBooks_DrPH
    },
    {
      name: "Doctor of Science in Computer Science and Engineering",
      link: "https://drive.google.com/drive/folders/1inJFmH8Rmja9bC20fzF_RwrmpUUljwDE",
      bookLinks:
        "https://drive.google.com/drive/folders/1-VFtyLaV75EKNh461ysEREIAJdJCFZMi", // allBooks_DSCSE
    },
    {
      name: "English as a Second Language",
      link: "https://drive.google.com/drive/folders/1QaZDL8OdXafYUCV0lSbpRE0nA1rt0ALp",
      bookLinks:
        "https://drive.google.com/drive/folders/11dLO-aMWd_9zHL7gYk2TuI_S8gPE7whS", // allBooks_ESL
    },
    {
      name: "Master of Health and Social Care Management",
      link: "https://drive.google.com/drive/folders/1M2vaH4lmBQxj8B59AqksFFo7bNebTzQr",
      bookLinks:
        "https://drive.google.com/drive/folders/1zdk6GWAd0NgO8TqS61ptKElZClDxjr0S", // allBooks_MPH
    },
    {
      name: "Master of Science in Business Administration",
      link: "https://drive.google.com/drive/folders/1PPtKrOf1RnJQClU99xtkh7ToGGyRNqkg",
      bookLinks:
        "https://drive.google.com/drive/folders/1lqsVRSJUHVM6VhFFYC-MH2viBdUBBXcO", // allBooks_MSBA
    },
    {
      name: "Master of Science in Civil Engineering",
      link: "https://drive.google.com/drive/folders/1NMGjhqauRZENMaM4pYdnK-9dlHUOXsGB",
      bookLinks:
        "https://drive.google.com/drive/folders/1u9AreygyDtwaPDM8qAYAB4go1Czj2XnA", // allBooks_MSc Civil
    },
    {
      name: "Master of Science in Computer Science and Engineering",
      link: "https://drive.google.com/drive/folders/13IrZQ6h4YO6fkMf-iO79ouFw2cSvBA81",
      bookLinks:
        "https://drive.google.com/drive/folders/1aAlCJ3Z4FZmundH83IcKmmwC5vLFnzme", // allBooks_MSCSE
    },
  ];

  const matchedFolder = studentInfo
    ? programFolders.find((folder) => folder.name === studentInfo.department)
    : null;
    
    const handleViewIdCard = () => {
  if (studentInfo) {
    navigate(`/dashboard/student-idCard/${studentInfo?.email}`, { state: { studentInfo } });
  }
};

// console.log(courseOutline)

  return (
    <div className="p-4 mt-6">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row items-center gap-5 mb-6">
        <div className="avatar">
          <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={studentInfo?.photo} alt="Student" />
          </div>
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-2xl font-bold uppercase">{studentInfo?.name}</h1>
          <p className="text-sm md:text-base">📧 {studentInfo?.email}</p>
          <p className="text-sm md:text-base">
            🏛 Dept: {studentInfo?.department}
          </p>
          <p className="text-sm md:text-base flex items-center gap-3">
            🆔 Student Id: {studentInfo?.studentId}
            <button
              onClick={handleViewIdCard}
              className="ml-4 btn btn-sm bg-green-300 text-black"
            >
              View & Download Student ID
            </button>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <StudentsProfileStats
          attendance={dashboardStats.attendance}
          grades={dashboardStats.grades}
          courses={dashboardStats.courses}
        />
      </div>

      {/* Department Folder Link */}
      {matchedFolder && (
        <>
          <div className="my-10 not-even:">
            <h2 className="text-lg font-semibold">
              📁 Departmental Curriculum Link:
            </h2>
            <a
              href={matchedFolder.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {matchedFolder.name}
            </a>
          </div>

          <div className="my-10 not-even:">
            <h2 className="text-lg font-semibold">
              📚 Departmental Books Link:
            </h2>
            <a
              href={matchedFolder.bookLinks}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {matchedFolder.name}
            </a>
          </div>
        </>
      )}

      {/* Course Distribution */}
      <div>
        <h2 className="text-xl font-semibold mb-3">
          📚 Course Distribution Outline
        </h2>

        {courseOutline?.quarters?.length > 0 ? (
          courseOutline.quarters.map((quarter, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-lg font-bold mb-2 text-highlight">
                Quarter {quarter.quarter || index + 1}
              </h3>
              {quarter.note && (
                <p className="text-md font-bold italic text-black mb-2">
                  📝 {quarter.note}
                </p>
              )}
              {quarter.courses?.length > 0 ? (
                <div className="overflow-x-auto bg-base-100 shadow rounded-lg max-w-[80%] mx-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr className="text-base text-base-content">
                        <th>#</th>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quarter.courses.map((course, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{course.code || "N/A"}</td>
                          <td>{course.name || course.title}</td>
                          <td>{course.credits ||course.units || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                !quarter.note && (
                  <p className="text-warning mt-2">
                    ⚠️ No course data available for this quarter.
                  </p>
                )
              )}
            </div>
          ))
        ) : (
          <p className="text-error">
            No course outline found for this department.
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboardHome;
