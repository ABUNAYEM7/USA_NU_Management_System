import { useParams } from "react-router";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AxiosSecure from "../../Components/Hooks/AxiosSecure";
import StudentReportGenerator from "../Student/StudentReportGenerator/StudentReportGenerator";

const StudentProgress = () => {
  const { email } = useParams();
  const [data, setData] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("");
  const axiosInstance = AxiosSecure();

  useEffect(() => {
    if (email) {
      let params = "";
      if (selectedQuarter !== "All") params += `semester=${selectedQuarter}`;
      if (selectedCourse !== "") {
        params += params
          ? `&courseName=${encodeURIComponent(selectedCourse)}`
          : `courseName=${encodeURIComponent(selectedCourse)}`;
      }
      const queryString = params ? `?${params}` : "";

      axiosInstance
        .get(`/student/full-overview/${email}${queryString}`)
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => console.error("Error fetching student overview:", err));
    }
  }, [email, selectedQuarter, selectedCourse]);

  const handleQuarterChange = (e) => {
    setSelectedQuarter(e.target.value);
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const chartData = data
    ? Object.entries(data.quarterStats).map(([quarter, courses]) => ({
        name: quarter,
        EnrolledCourses: courses.length,
      }))
    : [];

  const filteredStats =
    selectedQuarter === "All"
      ? chartData
      : chartData.filter((q) => q.name === selectedQuarter);

  const filteredQuarterCourses =
    selectedQuarter === "All"
      ? data?.enrolledCourses || []
      : data?.enrolledCourses?.filter(
          (course) => course.semester === selectedQuarter
        ) || [];

  const filteredPayments =
    selectedQuarter === "All"
      ? data?.payments || []
      : data?.payments?.filter((pay) => {
          const course = data?.enrolledCourses?.find(
            (c) => c.courseId === pay.courseId
          );
          return course?.semester === selectedQuarter;
        }) || [];

  const filteredGrades =
    selectedQuarter === "All"
      ? data?.gradeDetails || []
      : data?.gradeDetails?.filter(
          (grade) => grade.semester === selectedQuarter
        ) || [];

  const avgGrade = filteredGrades.length
    ? (
        filteredGrades.reduce((sum, g) => sum + g.point, 0) /
        filteredGrades.length
      ).toFixed(2)
    : null;

  const filteredAssignments =
    selectedQuarter === "All"
      ? data?.assignments || []
      : data?.assignments?.filter(
          (assign) => assign.semester === selectedQuarter
        ) || [];

  const releasedCount = filteredAssignments.length;
  const submittedCount = filteredAssignments.filter(
    (a) => a.status === "Submitted"
  ).length;

  const filteredAttendanceBySemester =
    selectedQuarter === "All"
      ? data?.attendanceDayByDay || []
      : (data?.attendanceDayByDay || []).filter(
          (record) => record.semester === selectedQuarter
        );

  const calculateAttendancePercentage = (courseName, attendanceReport) => {
    let total = 0;
    let present = 0;

    Object.entries(attendanceReport).forEach(([semester, courses]) => {
      if (courseName === "All") {
        Object.values(courses).forEach((records) => {
          records.forEach((rec) => {
            total++;
            if ((rec.status || "").toLowerCase() === "present") present++;
          });
        });
      } else {
        const records = courses[courseName];
        if (records) {
          records.forEach((rec) => {
            total++;
            if ((rec.status || "").toLowerCase() === "present") present++;
          });
        }
      }
    });

    return total > 0 ? ((present / total) * 100).toFixed(2) : "0.00";
  };

  return (
    <div className="mt-5 p-5 space-y-6">
      <h2 className="text-2xl font-bold">📈 Student Progress for {email}</h2>

      {/* Dropdown */}
      <div className="w-full max-w-sm">
        <label className="font-medium">Filter by Quarter:</label>
        <select
          className="w-full p-2 border rounded mt-1"
          onChange={handleQuarterChange}
          value={selectedQuarter}
        >
          <option value="All">All</option>
          {chartData.map((q) => (
            <option key={q.name} value={q.name}>
              {q.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bar Chart */}
      <div className="w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredStats}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="EnrolledCourses" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radial Progress Stats */}
      {data && (
        <div>
          <h3 className="text-2xl font-bold mb-6">
            🌀 Student Progress Percentage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div
                className="radial-progress text-primary"
                style={{
                  "--value": data.stats?.attendancePercentage || 0,
                  "--size": "6rem",
                  "--thickness": "0.6rem",
                }}
              >
                {data.stats?.attendancePercentage || 0}%
              </div>
              <p>Attendance</p>
            </div>
            <div className="text-center">
              <div
                className="radial-progress text-secondary"
                style={{
                  "--value": data.stats?.gradePercentage || 0,
                  "--size": "6rem",
                  "--thickness": "0.6rem",
                }}
              >
                {data.stats?.gradePercentage || 0}%
              </div>
              <p>Grades</p>
            </div>
            <div className="text-center">
              <div
                className="radial-progress text-accent"
                style={{
                  "--value": data.stats?.enrollmentPercentage || 0,
                  "--size": "6rem",
                  "--thickness": "0.6rem",
                }}
              >
                {data.stats?.enrollmentPercentage || 0}%
              </div>
              <p>Enrollment</p>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Courses */}
      {filteredQuarterCourses.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-xl font-semibold">📚 Enrolled Courses</h3>
          <table className="min-w-full text-sm border table-auto mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Course Name</th>
                <th className="text-left p-2">Semester</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuarterCourses.map((course, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{course.courseName}</td>
                  <td className="p-2">{course.semester}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Daily Attendance */}
      {filteredAttendanceBySemester.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-xl font-semibold">📅 Daily Attendance Report</h3>
          <table className="min-w-full text-sm border table-auto mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Course</th>
                <th className="text-left p-2">Semester</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendanceBySemester.map((a, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td className="p-2">{a.courseName}</td>
                  <td className="p-2">{a.semester}</td>
                  <td className="p-2">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignments */}
      {filteredAssignments.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-xl font-semibold">📝 Assignments Overview</h3>
          <table className="min-w-full text-sm border table-auto mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Assignment</th>
                <th className="text-left p-2">Course</th>
                <th className="text-left p-2">Semester</th>
                <th className="text-left p-2">Released</th>
                <th className="text-left p-2">Submitted</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">File</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((a, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{a.title}</td>
                  <td className="p-2">{a.courseName}</td>
                  <td className="p-2">{a.semester}</td>
                  <td className="p-2">
                    {a.releasedDate
                      ? new Date(a.releasedDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2">
                    {a.submittedDate
                      ? new Date(a.submittedDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2">{a.status}</td>
                  <td className="p-2">
                    {a.submittedFile ? (
                      <a
                        href={`http://localhost:3000/${a.submittedFile.replace(
                          /\\/g,
                          "/"
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View File
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grades */}
      {filteredGrades.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-xl font-semibold">📊 Grade Report</h3>
          <table className="min-w-full text-sm border table-auto mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Course Name</th>
                <th className="text-left p-2">Semester</th>
                <th className="text-left p-2">Grade Point</th>
                <th className="text-left p-2">Out of</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.map((grade, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{grade.courseName}</td>
                  <td className="p-2">{grade.semester}</td>
                  <td className="p-2">{grade.point}</td>
                  <td className="p-2">{grade.outOf || 4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Daily Attendance Report */}
      {data?.dailyAttendanceReport && (
        <div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <h3 className="text-xl font-semibold">
              📅 Detailed Daily Attendance
            </h3>

            {/* Select course dropdown */}
            {filteredQuarterCourses.length > 0 && (
              <div className="w-full max-w-sm mt-4">
                <label className="font-medium">Filter by Course:</label>
                <select
                  className="w-full p-2 border rounded mt-1"
                  onChange={handleCourseChange}
                  value={selectedCourse}
                >
                  <option value="">Select Course</option>
                  <option value="All">All</option>
                  {filteredQuarterCourses.map((course, idx) => (
                    <option key={idx} value={course.courseName}>
                      {course.courseName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Show prompt if no course selected */}
          {selectedCourse === "" && (
            <p className="mt-4 text-red-700 italic">
              Please select a course to view the daily attendance report.
            </p>
          )}

          {/* Show attendance and percentage only when a course is selected */}
          {selectedCourse !== "" && (
            <>
              {/* Attendance Percentage */}
              <p className="mt-4 font-semibold text-highlight">
                Attendance Percentage:{" "}
                {calculateAttendancePercentage(
                  selectedCourse,
                  data.dailyAttendanceReport
                )}
                %
              </p>

              {/* Attendance Table */}
              {Object.entries(data.dailyAttendanceReport)
                .filter(
                  ([semester]) =>
                    selectedQuarter === "All" || selectedQuarter === semester
                )
                .map(([semester, courses]) => {
                  if (selectedCourse === "All") {
                    const allRecords = Object.values(courses).flat();
                    if (allRecords.length === 0) return null;
                    return (
                      <div key={semester} className="mt-4 overflow-x-auto">
                        <h4 className="font-medium text-lg text-gray-700">
                          📘 {semester}
                        </h4>
                        <table className="min-w-full text-sm border table-auto">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-left p-2">Course</th>
                              <th className="text-left p-2">Date</th>
                              <th className="text-left p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(courses).map(
                              ([courseName, records]) =>
                                records.map((rec, idx) => (
                                  <tr
                                    key={`${courseName}-${idx}`}
                                    className="border-t"
                                  >
                                    <td className="p-2">{courseName}</td>
                                    <td className="p-2">
                                      {new Date(rec.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-2">{rec.status}</td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    );
                  } else {
                    const records = courses[selectedCourse];
                    if (!records) return null;
                    return (
                      <div key={semester} className="mt-4 overflow-x-auto">
                        <h4 className="font-medium text-lg text-gray-700">
                          📘 {semester}
                        </h4>
                        <table className="min-w-full text-sm border table-auto">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-left p-2">Course</th>
                              <th className="text-left p-2">Date</th>
                              <th className="text-left p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {records.map((rec, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="p-2">{selectedCourse}</td>
                                <td className="p-2">
                                  {new Date(rec.date).toLocaleDateString()}
                                </td>
                                <td className="p-2">{rec.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                })}
            </>
          )}
        </div>
      )}

      {/* Payments */}
      {filteredPayments.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-xl font-semibold">💳 Payment History</h3>
          <table className="min-w-full text-sm border table-auto mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Transaction ID</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((pay, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 break-words">{pay.transactionId}</td>
                  <td className="p-2">${pay.amount}</td>
                  <td className="p-2">
                    {new Date(pay.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="my-10">
        <StudentReportGenerator
          email={email}
          selectedQuarter={selectedQuarter}
          setSelectedQuarter={setSelectedQuarter}
          reportData={data}
          dailyAttendanceReport={data?.dailyAttendanceReport}
        />
      </div>
    </div>
  );
};

export default StudentProgress;
