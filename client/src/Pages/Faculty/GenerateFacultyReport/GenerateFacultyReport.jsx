import { useState, useEffect } from "react";
import axios from "axios";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const GenerateFacultyReport = ({ email, name }) => {
  const [filterFacultyData, setFilterFacultyData] = useState("");
  const [reportData, setReportData] = useState(null);

  const axiosInstance = AxiosSecure();

  const semesters = [
    "Quarter-1", "Quarter-2", "Quarter-3", "Quarter-4", "Quarter-5", 
    "Quarter-6", "Quarter-7", "Quarter-8", "Quarter-9", "Quarter-10",
    "Quarter-11", "Quarter-12", "Quarter-13", "Quarter-14", "Quarter-15", "Quarter-16"
  ];

  const handleFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setFilterFacultyData(selectedFilter);
  };

  useEffect(() => {
    const fetchReportData = async () => {
      if (filterFacultyData) {
        try {
          const response = await axiosInstance.get(`/faculty-quarter-report/${email}`, {
            params: { quarter: filterFacultyData }, // Send the selected quarter as a query param
          });
          setReportData(response.data); // Set the received report data to state
        } catch (error) {
          console.error("Error fetching faculty report:", error);
        }
      }
    };

    fetchReportData();
  }, [email, filterFacultyData]); // Run whenever filterFacultyData changes

const generatePDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(16);

  // Title - Faculty Quarterly Report
  doc.text(`Faculty Quarterly Report - ${name}`, 14, 10); // Include faculty name in the title

  // Set starting position for the first table
  let startY = 20; // Set an explicit startY for the first content block

  // Assigned Courses Table
  doc.text("Assigned Courses:", 14, startY); // Add title before table
  if (reportData.assignedCourses.length > 0) {
    doc.autoTable({
      startY: startY + 10, // Set startY to be right after the title
      head: [["Course Name", "Course ID", "Semester", "Credits"]],
      body: reportData.assignedCourses.map(course => [
        course.name,
        course.courseId,
        course.semester,
        course.credit
      ]),
      theme: 'striped',
    });
    startY = doc.autoTable.previous.finalY; // Update startY for the next section based on the last table's position
  } else {
    doc.text("No assigned courses for this quarter", 14, startY + 10);
    startY = doc.autoTable.previous.finalY; // Update startY for the next section
  }

  // Assignments Table
  doc.text("Assignments:", 14, startY + 10); // Add title before table
  if (reportData.assignments.length > 0) {
    doc.autoTable({
      startY: startY + 20, // Set startY to be right after the title
      head: [["Title", "Course ID", "Semester", "Status", "Deadline"]],
      body: reportData.assignments.map(assignment => {
        const status = new Date(assignment.deadline) < new Date() ? 'Expired' : 'Active'; // Set status based on deadline
        return [
          assignment.title,
          assignment.courseId,
          assignment.semester,
          status,
          new Date(assignment.deadline).toLocaleString() // Format deadline date for display
        ];
      }),
      theme: 'striped',
    });
    startY = doc.autoTable.previous.finalY; // Update startY for the next section based on the last table's position
  } else {
    doc.text("No assignments uploaded for this quarter", 14, startY + 10);
    startY = doc.autoTable.previous.finalY; // Update startY for the next section
  }

  // Uploaded Materials Table
  doc.text("Uploaded Materials:", 14, startY + 10); // Add title before table
  if (reportData.materials.length > 0) {
    doc.autoTable({
      startY: startY + 20, // Set startY to be right after the title
      head: [["Title", "Course ID", "Semester"]],
      body: reportData.materials.map(material => [
        material.title,
        material.courseId,
        filterFacultyData || 'N/A' // Use selected quarter as the semester for materials
      ]),
      theme: 'striped',
    });
    startY = doc.autoTable.previous.finalY; // Update startY for the next section based on the last table's position
  } else {
    doc.text("No materials uploaded for this quarter", 14, startY + 10);
    startY = doc.autoTable.previous.finalY; // Update startY for the next section
  }

  // Class Summary Table
  doc.text("Class Summary:", 14, startY + 10); // Add title before table
  if (reportData.totalClasses > 0) {
    doc.autoTable({
      startY: startY + 20, // Set startY to be right after the title
      head: [["Total Classes", "Completed Classes", "Canceled Classes"]],
      body: [
        [
          reportData.totalClasses,
          reportData.completedClasses,
          reportData.canceledClasses,
        ],
      ],
      theme: 'striped',
    });
  } else {
    doc.text("No class data available for this quarter", 14, startY + 10);
  }

  // Save PDF
  doc.save(`Faculty_Quarterly_Report_${filterFacultyData}.pdf`);
};

  console.log(reportData?.assignments)

  return (
    <div className="border-2 border-blue-500 p-6 rounded-lg">
      <div className="my-6">
        <p className="text-2xl font-medium text-highlight">Generate Faculty Quarterly Report</p>
      </div>
      <div className="mb-6 p-4 bg-gray-50">
        <label className="block text-sm font-medium mb-2">Filter Faculty Activities</label>
        <select
          className="select select-bordered w-full"
          value={filterFacultyData}
          onChange={handleFilterChange}
        >
          <option value="">Select Filter</option>
          {semesters.map((semester, index) => (
            <option key={index} value={semester}>
              {semester}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-xl">Faculty Report for {name} ({email})</h3>
        <p>Selected Quarter: {filterFacultyData || "None"}</p>
        {reportData && (
          <div className="mt-4">
            {/* Assigned Courses Table */}
            <h4 className="font-bold mt-4">Assigned Courses:</h4>
            {reportData.assignedCourses.length > 0 ? (
              <table className="table-auto w-full border-collapse border border-gray-200">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Course Name</th>
                    <th className="border px-4 py-2">Course ID</th>
                    <th className="border px-4 py-2">Semester</th>
                    <th className="border px-4 py-2">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.assignedCourses?.map((course, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{course.name}</td>
                      <td className="border px-4 py-2">{course.courseId}</td>
                      <td className="border px-4 py-2">{course.semester}</td>
                      <td className="border px-4 py-2">{course.credit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No assigned courses for this quarter</p>
            )}

            {/* Assignments Table */}
            <h4 className="font-bold mt-4">Assignments:</h4>
            {reportData.assignments.length > 0 ? (
              <table className="table-auto w-full border-collapse border border-gray-200">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Title</th>
                    <th className="border px-4 py-2">Course ID</th>
                    <th className="border px-4 py-2">Semester</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.assignments?.map((assignment, index) => {
                    const status = new Date(assignment.deadline) < new Date() ? 'Expired' : 'Active'; // Set status based on deadline
                    return (
                      <tr key={index}>
                        <td className="border px-4 py-2">{assignment.title}</td>
                        <td className="border px-4 py-2">{assignment.courseCode
}</td>
                        <td className="border px-4 py-2">{assignment.semester}</td>
                        <td className="border px-4 py-2">{status}</td>
                        <td className="border px-4 py-2">{new Date(assignment.deadline).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>No assignments uploaded for this quarter</p>
            )}

            {/* Uploaded Materials Table */}
            <h4 className="font-bold mt-4">Uploaded Materials:</h4>
            {reportData.materials.length > 0 ? (
              <table className="table-auto w-full border-collapse border border-gray-200">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Title</th>
                    <th className="border px-4 py-2">Course ID</th>
                    <th className="border px-4 py-2">Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.materials?.map((material, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{material.title}</td>
                      <td className="border px-4 py-2">{material.courseId}</td>
                      <td className="border px-4 py-2">{filterFacultyData || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No materials uploaded for this quarter</p>
            )}

            {/* Class Summary */}
            <h4 className="font-bold mt-4">Class Summary:</h4>
            <p>Total Classes: {reportData.totalClasses}</p>
            <p>Completed Classes: {reportData.completedClasses}</p>
            <p>Canceled Classes: {reportData.canceledClasses}</p>

            {/* Button to generate PDF */}
            <button
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              onClick={generatePDF}
            >
              Download Report as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateFacultyReport;
