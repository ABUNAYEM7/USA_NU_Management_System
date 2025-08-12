import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AxiosSecure from "../Hooks/AxiosSecure";
import Swal from "sweetalert2";
import useAuth from "../Hooks/useAuth";

const AddRoutine = () => {
  const [formData, setFormData] = useState({
    semester: "",
    department: "",
    weekStartDate: "",
    routines: [],
  });

  const { user } = useAuth();
  const axiosInstance = AxiosSecure();
  const navigate = useNavigate();
  const { routineId, dayIndex } = useParams();

  const [facultyList, setFacultyList] = useState([]);
  const [currentDay, setCurrentDay] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentLink, setCurrentLink] = useState("");
  const [errors, setErrors] = useState({});

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
  const semesters = [
    "Quarter-1",
    "Quarter-2",
    "Quarter-3",
    "Quarter-4",
    "Quarter-5",
    "Quarter-6",
    "Quarter-7",
    "Quarter-8",
    "Quarter-9",
    "Quarter-10",
    "Quarter-11",
    "Quarter-12",
    "Quarter-13",
    "Quarter-14",
    "Quarter-15",
    "Quarter-16",
  ];

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  useEffect(() => {
    if (routineId && dayIndex !== undefined) {
      axiosInstance.get(`/get-routine/${routineId}`).then((res) => {
        const data = res.data;
        const selectedDay = data.routines[dayIndex];
        setFormData({
          semester: data.semester,
          department: data.department,
          weekStartDate: data.weekStartDate,
          routines: data.routines,
        });
        setCurrentDay(selectedDay.day);
        setCurrentTime(selectedDay.time);
        setCurrentLink(selectedDay.onlineLink);
        setSelectedCourse(selectedDay.course || "");
      });
    }
  }, [routineId, dayIndex]);

  useEffect(() => {
    if (formData.department) {
      // Fetch faculties
      axiosInstance
        .get(`/faculties-by-department?department=${formData.department}`)
        .then((res) => setFacultyList(res.data))
        .catch((err) => {
          console.error("Error fetching faculty list:", err);
          setFacultyList([]);
        });

      // Fetch courses
      axiosInstance
        .get(`/all-courses-by-department?department=${formData.department}`)
        .then((res) => {
          setCourseList(
            Array.isArray(res.data.courses) ? res.data.courses : []
          );
        })
        .catch((err) => {
          console.error("Error fetching course list:", err);
          setCourseList([]);
        });
    } else {
      setFacultyList([]);
      setCourseList([]);
    }
  }, [formData.department]);

  const handleFieldChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const addRoutineEntry = () => {
    let routineErrors = {};

    if (!currentDay) routineErrors.currentDay = "CurrentDay is required";
    if (!currentTime) routineErrors.currentTime = "CurrentTime is required";
    if (!currentLink) routineErrors.currentLink = "CurrentLink is required";
    if (facultyList.length === 0)
      routineErrors.faculty = "FacultyList is required";
    if (!formData.semester) routineErrors.semester = "Semester is required";
    if (!formData.department)
      routineErrors.department = "Department is required";
    if (!selectedCourse) routineErrors.selectedCourse = "Course is required";

    if (Object.keys(routineErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...routineErrors }));
      return;
    }

    const facultyEmails = facultyList.map((f) => f.facultyEmail);
    const newRoutine = {
      day: currentDay,
      time: currentTime,
      course: selectedCourse,
      onlineLink: currentLink,
      facultyEmails,
      status: "pending",
    };

    setFormData((prev) => ({
      ...prev,
      routines: [...prev.routines, newRoutine],
    }));

    setCurrentDay("");
    setCurrentTime("");
    setCurrentLink("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};

    if (!formData.semester) formErrors.semester = "Semester is required";
    if (!formData.department) formErrors.department = "Department is required";
    if (!formData.weekStartDate)
      formErrors.weekStartDate = "WeekStartDate is required";
    if (formData.routines.length === 0)
      formErrors.routines = "At least one day must be added to the routine.";

    if (Object.keys(formErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...formErrors }));
      return;
    }

    const routineEntry = {
      day: currentDay,
      time: currentTime,
      course: selectedCourse,
      onlineLink: currentLink,
      facultyEmails: facultyList.map((f) => f.facultyEmail),
    };

    try {
      if (routineId && dayIndex !== undefined) {
        const res = await axiosInstance.patch(
          `/update-routine-day/${routineId}/${dayIndex}`,
          routineEntry
        );

        if (res.data?.modifiedCount > 0) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: `Routine Day Updated Successfully!`,
            showConfirmButton: false,
            timer: 1500,
          });
          navigate("/dashboard/routine");
        }
      } else {
        const fullRoutine = {
          ...formData,
          createdBy: user?.email || "unknown",
        };

        const res = await axiosInstance.post(
          "/add/weekly-routine",
          fullRoutine
        );

        if (res.data?.insertedId) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: `Weekly Routine Uploaded Successfully!`,
            showConfirmButton: false,
            timer: 1500,
          });
          setFormData({
            semester: "",
            department: "",
            weekStartDate: "",
            routines: [],
          });
          setCurrentDay("");
          setCurrentTime("");
          setCurrentLink("");
        }
      }
    } catch (err) {
      console.error("Routine submission/update error:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-[color:var(--prime)]">
        🗓️ {routineId ? "Edit" : "Add"} Weekly Online Class Routine
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-base-100 p-8 rounded-xl shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label font-semibold">Quarter</label>
            <select
              name="semester"
              className="select w-full border-2 border-prime focus:outline-none"
              onChange={handleFieldChange}
              value={formData.semester}
              disabled={!!routineId}
            >
              <option value="">Select Quarter</option>
              {semesters?.map((sem, idx) => (
                <option key={idx} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
            {errors?.semester && (
              <p className="text-red-500 text-sm mt-1">{errors.semester}</p>
            )}
          </div>

          <div className="form-control">
            <label className="label font-semibold">Department</label>
            <select
              name="department"
              className="select w-full border-2 border-prime focus:outline-none"
              onChange={handleFieldChange}
              value={formData.department}
              disabled={!!routineId}
            >
              <option value="">Select Department</option>
              <optgroup label="Bachelor Programs">
                {BachelorProgram.map((dept, idx) => (
                  <option key={`b-${idx}`} value={dept}>
                    {dept}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Masters Programs">
                {Masters.map((dept, idx) => (
                  <option key={`m-${idx}`} value={dept}>
                    {dept}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Doctorate Programs">
                {Doctorate.map((dept, idx) => (
                  <option key={`d-${idx}`} value={dept}>
                    {dept}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Associate Program">
                {Associate.map((dept, idx) => (
                  <option key={`a-${idx}`} value={dept}>
                    {dept}
                  </option>
                ))}
              </optgroup>
            </select>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department}</p>
            )}
          </div>

          <div className="form-control md:col-span-2">
            <label className="label font-semibold">Course</label>
            <select
              className="select w-full border-2 border-prime focus:outline-none"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select Course</option>
              {courseList?.map((course, idx) => (
                <option key={idx} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors?.selectedCourse && (
              <p className="text-red-500 text-sm mt-1">
                {errors.selectedCourse}
              </p>
            )}
          </div>

          <div className="form-control md:col-span-2">
            <label className="label font-semibold">Week Start Date</label>
            <input
              type="date"
              name="weekStartDate"
              className="input w-full border-2 border-prime focus:outline-none"
              onChange={handleFieldChange}
              value={formData.weekStartDate}
              disabled={!!routineId}
            />
            {errors.weekStartDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.weekStartDate}
              </p>
            )}
          </div>

          <div className="form-control">
            <label className="label font-semibold">Day</label>
            <select
              className="select w-full border-2 border-prime focus:outline-none"
              value={currentDay}
              onChange={(e) => {
                setCurrentDay(e.target.value);
                setErrors((prev) => ({ ...prev, currentDay: "" }));
              }}
            >
              <option value="">Select Day</option>
              {daysOfWeek?.map((day, idx) => (
                <option key={idx} value={day}>
                  {day}
                </option>
              ))}
            </select>
            {errors?.currentDay && (
              <p className="text-red-500 text-sm mt-1">{errors.currentDay}</p>
            )}
          </div>

          <div className="form-control">
            <label className="label font-semibold">Time</label>
            <input
              type="text"
              className="input w-full border-2 border-prime focus:outline-none"
              value={currentTime}
              onChange={(e) => {
                setCurrentTime(e.target.value);
                setErrors((prev) => ({ ...prev, currentTime: "" }));
              }}
              placeholder="e.g., 10:00 AM - 11:30 AM"
            />
            {errors?.currentTime && (
              <p className="text-red-500 text-sm mt-1">{errors.currentTime}</p>
            )}
          </div>

          <div className="form-control md:col-span-2">
            <label className="label font-semibold">Online Class Link</label>
            <input
              type="url"
              className="input w-full border-2 border-prime focus:outline-none"
              value={currentLink}
              onChange={(e) => {
                setCurrentLink(e.target.value);
                setErrors((prev) => ({ ...prev, currentLink: "" }));
              }}
              placeholder="https://zoom.us/..."
            />
            {errors?.currentLink && (
              <p className="text-red-500 text-sm mt-1">{errors.currentLink}</p>
            )}
          </div>

          {!routineId && (
            <>
              <div className="md:col-span-2 text-right">
                <button
                  type="button"
                  className="btn bg-green-600 text-white mt-2"
                  onClick={addRoutineEntry}
                >
                  ➕ Add to Weekly Routine
                </button>
                {errors?.routines && (
                  <p className="text-red-500 text-sm mt-2">{errors.routines}</p>
                )}
              </div>

              {formData?.routines?.length > 0 && (
                <div className="md:col-span-2 bg-base-200 p-4 rounded">
                  <label className="label font-semibold text-primary">
                    Weekly Schedule Preview
                  </label>
                  <ul className="list-disc list-inside text-sm">
                    {formData?.routines?.map((entry, idx) => (
                      <li key={idx}>
                        <strong>{entry.day}</strong>: {entry.time} |{" "}
                        {entry.onlineLink} | {entry?.course}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div className="text-center mt-8">
          <button type="submit" className="btn bg-prime text-black px-10">
            {routineId ? "Update" : "Submit"} Weekly Routine
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoutine;
