import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const StudentReportGenerator = ({
  email,
  selectedQuarter,
  setSelectedQuarter,
  reportData,
  dailyAttendanceReport,
}) => {
  if (!reportData) return null;

  const getAttendancePercentage = () => reportData.stats?.attendancePercentage ?? "";
  const getGradePercentage = () => reportData.stats?.gradePercentage ?? "";

  const getAssignmentsReleased = () => {
    if (selectedQuarter === "All") {
      return reportData.assignments?.length ?? 0;
    }
    return reportData.assignments?.filter(a => a.semester === selectedQuarter)?.length ?? 0;
  };

  const getAssignmentsSubmitted = () => {
    if (selectedQuarter === "All") {
      return reportData.assignments?.filter(a => a.status === "Submitted")?.length ?? 0;
    }
    return reportData.assignments?.filter(a => a.semester === selectedQuarter && a.status === "Submitted")?.length ?? 0;
  };

  const getLeaveRequests = () => reportData.leaveRequests ?? 0;

  const getEnrolledCourses = () => {
    if (selectedQuarter === "All") return reportData.enrolledCourses || [];
    return reportData.enrolledCourses?.filter(c => c.semester === selectedQuarter) || [];
  };

const handleDownload = () => {
  if (!selectedQuarter || !reportData) return;

  const attendancePercentage = getAttendancePercentage();
  const gradePercentage = getGradePercentage();
  const assignmentsReleasedCount = getAssignmentsReleased();
  const assignmentsSubmittedCount = getAssignmentsSubmitted();
  const leaveRequestsCount = getLeaveRequests();
  const enrolledCourses = getEnrolledCourses();

  const pdf = new jsPDF();  // Corrected: use pdf instead of doc
  const marginLeft = 15;
  const pageHeight = pdf.internal.pageSize.getHeight();
  let y = 20;

  // Header & summary
  pdf.setFontSize(16);
  pdf.text(`Student Report for ${email}`, marginLeft, y);
  y += 10;

  pdf.setFontSize(12);
  pdf.text(`Quarter: ${selectedQuarter}`, marginLeft, y);
  y += 10;
  pdf.text(`Attendance: ${attendancePercentage || "N/A"}%`, marginLeft, y);
  y += 10;
  pdf.text(`Grade Performance: ${gradePercentage || "N/A"}%`, marginLeft, y);
  y += 10;
  pdf.text(`Assignments Released: ${assignmentsReleasedCount}`, marginLeft, y);
  y += 10;
  pdf.text(`Assignments Submitted: ${assignmentsSubmittedCount}`, marginLeft, y);
  y += 10;
  pdf.text(`Leave Requests: ${leaveRequestsCount}`, marginLeft, y);
  y += 15;

  // Enrolled Courses Section
  pdf.text("Enrolled Courses:", marginLeft, y);
  y += 10;
  if (enrolledCourses.length > 0) {
    const courseRows = enrolledCourses.map(course => [
      course.courseName, 
      course.courseId,
      course.semester
    ]);

    autoTable(pdf, {
      startY: y,
      head: [["Course Name", "Course ID", "Semester"]],
      body: courseRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [100, 100, 100] },
      margin: { left: marginLeft, right: marginLeft },
    });

    y = pdf.autoTable.previous.finalY + 10;
  } else {
    pdf.text("No courses enrolled this quarter.", marginLeft, y);
    y += 10;
  }

  // Assignments Section
  if (assignmentsReleasedCount > 0) {
    pdf.text("Assignments:", marginLeft, y);
    y += 10;

    const assignments = reportData.assignments.filter(a =>
      selectedQuarter === "All" ? true : a.semester === selectedQuarter
    );
    const assignmentRows = assignments.map(assignment => {
      const status = new Date(assignment.submittedDate) < new Date() ? "Expired" : "Active";

      // Validate and format the submittedDate
      let submittedDateStr = "Not Submitted";
      const submittedDate = new Date(assignment.submittedDate);
      if (!isNaN(submittedDate)) {
        submittedDateStr = submittedDate.toLocaleString();  // Format the submitted date
      }

      return [
        assignment.title,
        assignment.courseId,
        assignment.semester,
        status,
        submittedDateStr  // Use the formatted or fallback submittedDate
      ];
    });

    autoTable(pdf, {
      startY: y,
      head: [["Title", "Course ID", "Semester", "Status", "Submitted Date"]],
      body: assignmentRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [100, 100, 100] },
      margin: { left: marginLeft, right: marginLeft },
    });

    y = pdf.autoTable.previous.finalY + 10;
  } else {
    pdf.text("No assignments uploaded for this quarter", marginLeft, y);
    y += 10;
  }

  // Daily Attendance Report Section
  if (dailyAttendanceReport && Object.keys(dailyAttendanceReport).length > 0) {
    pdf.text("Daily Attendance Report:", marginLeft, y);
    y += 10;

    const attendanceRows = [];
    if (selectedQuarter === "All") {
      for (const [semester, courses] of Object.entries(dailyAttendanceReport)) {
        if (typeof courses !== "object" || courses === null) continue;
        for (const [courseName, records] of Object.entries(courses)) {
          if (!Array.isArray(records)) continue;
          records.forEach(rec => {
            attendanceRows.push([
              semester,
              courseName,
              new Date(rec.date).toLocaleDateString(),
              rec.status,
            ]);
          });
        }
      }
    } else {
      const semesterCourses = dailyAttendanceReport[selectedQuarter];
      if (semesterCourses && typeof semesterCourses === "object") {
        for (const [courseName, records] of Object.entries(semesterCourses)) {
          if (!Array.isArray(records)) continue;
          records.forEach(rec => {
            attendanceRows.push([
              selectedQuarter,
              courseName,
              new Date(rec.date).toLocaleDateString(),
              rec.status,
            ]);
          });
        }
      }
    }

    if (attendanceRows.length === 0) {
      pdf.text("No attendance records available.", marginLeft, y);
      y += 10;
    } else {
      autoTable(pdf, {
        startY: y,
        head: [["Semester", "Course", "Date", "Status"]],
        body: attendanceRows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [100, 100, 100] },
        margin: { left: marginLeft, right: marginLeft },
      });
      y = pdf.autoTable.previous.finalY + 10;
    }
  } else {
    pdf.text("No daily attendance records available.", marginLeft, y);
    y += 10;
  }

  // Save PDF
  pdf.save(`Student_Report_${email}_${selectedQuarter}.pdf`);
};



  const isDownloadDisabled = !selectedQuarter || !reportData;
  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">📤 Download Student Report</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Quarter:</label>
        <select
          className="w-full border p-2 rounded"
          onChange={e => setSelectedQuarter(e.target.value)}
          value={selectedQuarter}
        >
          <option value="">-- Select Quarter --</option>
          <option value="All">All</option>
          {[...Array(16)].map((_, i) => (
            <option key={i + 1} value={`Quarter-${i + 1}`}>
              Quarter {i + 1}
            </option>
          ))}
        </select>
      </div>

      {reportData && (
        <div className="mt-6 border-t pt-4 text-sm text-gray-700">
          <h4 className="font-bold text-base mb-2">📄 Report Preview</h4>
          <p><strong>Student:</strong> {email}</p>
          <p><strong>Quarter:</strong> {selectedQuarter}</p>
          <p><strong>Attendance:</strong> {getAttendancePercentage() || "N/A"}%</p>
          <p><strong>Grade Performance:</strong> {getGradePercentage() || "N/A"}%</p>
          <p><strong>Assignments Released:</strong> {getAssignmentsReleased() || "0"}</p>
          <p><strong>Assignments Submitted:</strong> {getAssignmentsSubmitted() || "0"}</p>
          <p><strong>Leave Requests:</strong> {getLeaveRequests() || "0"}</p>
          <p><strong>Courses:</strong> {getEnrolledCourses().map(c => c.courseName).join(", ") || "None"}</p>
        </div>
      )}

      {dailyAttendanceReport && Object.keys(dailyAttendanceReport).length > 0 && (
        <div className="mt-6">
          <h4 className="font-bold mb-2">📅 Daily Attendance Report</h4>
          {Object.entries(dailyAttendanceReport).map(([semester, courses]) => (
            <div key={semester} className="mb-6">
              <h5 className="text-lg font-semibold mb-2">{semester}</h5>
              <div className="overflow-x-auto">
                {Object.entries(courses).map(([courseName, records]) => (
                  <div key={courseName} className="mb-4">
                    <h6 className="font-medium mb-1">{courseName}</h6>
                    <table className="table table-zebra w-full text-sm">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map(({ date, status }, idx) => (
                          <tr key={idx}>
                            <td>{new Date(date).toLocaleDateString()}</td>
                            <td>{status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={isDownloadDisabled}
        className={`mt-5 px-4 py-2 rounded text-white ${
          isDownloadDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        📥 Download PDF Report
      </button>
    </div>
  );
};

export default StudentReportGenerator;
