import React from "react";
import { Route, Routes } from "react-router";
import MainLayout from "../MainLayout/MainLayout";
import Home from "../Pages/Home/Home";
import SignIn from "../Pages/Registration/SignIn";
import SignUp from "../Pages/Registration/SignUp";
import AdminDashboardHome from "../Pages/Admin/AdminHome/AdminDashboardHome";
import Courses from "../Pages/Admin/Courses/Courses";
import ManageFaculty from "../Pages/Admin/ManageFaculty/ManageFaculty";
import ManageStudents from "../Pages/Admin/ManageStudents/ManageStudents";
import AddCourses from "../Pages/Admin/AddCourses/AddCourses";
import EditCourse from "../Components/DynamicRoute/EditCourse/EditCourse";
import ManageUsers from "../Pages/Admin/ManageUsers/ManageUsers";
import Profile from "../Pages/Student/Profile/Profile";
import PrivateRoute from "../Pages/PrivateRoute/PrivateRoute";
import Dashboard from "../Pages/DashBoard/Dashboard";
import { Navigate } from "react-router";
import Attendance from "../Pages/Student/Attendance/Attendance";
import Grade from "../Pages/Student/Grade/Grade";
import Fee from "../Pages/Student/Fee/Fee";
import FacultyDashboard from "../Pages/Faculty/FacultyDashboard/FacultyDashboard";
import StudentsDashboardHome from "../Pages/Student/StudentDashboardHome/StudentDashboardHome";
import FacultyCourses from "../Pages/Faculty/FacultyCourses/FacultyCourses";
import FacultyGrades from "../Pages/Faculty/FacultyGrades/FacultyGrades";
import FacultyAttendance from "../Pages/Faculty/FacultyAttendance/FacultyAttendance";
import CreateAssignment from "../Pages/Faculty/createAssignment/CreateAssignment";
import Materials from "../Pages/Faculty/Materials/Materials";
import AddFaculty from "../Pages/Admin/ManageFaculty/AddFaculty";
import AddMaterials from "../Pages/Faculty/AddMaterials/AddMaterials";
import Assignment from "../Pages/Faculty/Assignment/Assignment";
import AssignmentDetails from "../Pages/Faculty/AssingmentDetails/AssignmentDetails";
import LeaveForm from "../Pages/Student/LeaveForm/LeaveForm";
import StudentAssignment from "../Pages/Student/StudentAssignment/StudentAssignment";
import StudentsCourses from "../Pages/Student/StudentsCourses/StudentsCourses";
import CreateStudentForm from "../Components/CreateStudentForm/CreateStudentForm";
import ViewUserDetails from "../Components/ViewUserDetails/ViewUserDetails";
import Routine from "../Pages/Admin/Routine/Routine";
import AddRoutine from "../Components/AddRoutine/AddRoutine";
import FacultyRoutine from "../Pages/Faculty/FacultyRoutine/FacultyRoutine";
import StudentRoutine from "../Pages/Student/StudentRoutine/StudentRoutine";
import SendMessage from "../Components/SendMessage/SendMessage";
import Message from "../Pages/Message/Message";
import Academic from "../Pages/Academic/Academic";
import CourseDetails from "../Pages/CourseDetails/CourseDetails";
import PaymentPage from "../Pages/PaymentPage/PaymentPage";
import ReviewEnrollReq from "../Pages/ReviewEnrollReq/ReviewEnrollReq";
import Enroll from "../Pages/Enroll";
import StudentsMaterials from "../Pages/StudentsMaterials/StudentsMaterials";
import SentBox from "../Pages/SentBox/SentBox";
import ErrorPage from "../Pages/ErrorPage/ErrorPage";
import StudentProgress from "../Pages/StudentProgress/StudentProgress";
import AboutPage from "../Pages/AboutPage/AboutPage";
import ViewSubmissions from "../Pages/ViewSubmissions/ViewSubmissions";
import StudentIdCard from "../Pages/StudentIdCard/StudentIdCard";
import EnrollmentRequests from "../Pages/Student/EnrollmentRequests/EnrollmentRequests";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="academic" element={<Academic />} />
        <Route path="signIn" element={<SignIn />} />
        <Route path="signUp" element={<SignUp />} />
        <Route path="edit-course/:id" element={<EditCourse />} />
        <Route path="enroll" element={<Enroll />} />
        <Route path="aboutPage" element={<AboutPage />} />

        {/* Protected Dashboard Route for Admin & Student */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Redirect based on role */}
          <Route index element={<Navigate to="home" replace />} />

          {/* Admin Routes */}
          <Route path="admin/home" element={<AdminDashboardHome />} />
          <Route path="courses" element={<Courses />} />
          <Route path="add-courses" element={<AddCourses />} />
          <Route path="manage-students" element={<ManageStudents />} />
          <Route path="manage-faculty" element={<ManageFaculty />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="routine" element={<Routine />} />
          <Route path="add-routine" element={<AddRoutine />} />
          <Route
            path="edit-routine/:routineId/:dayIndex"
            element={<AddRoutine />}
          />
          <Route path="/dashboard/add-faculty" element={<AddFaculty />} />
          <Route
            path="/dashboard/add-student/:id"
            element={<CreateStudentForm />}
          />
          <Route
            path="/dashboard/view-details/:email"
            element={<ViewUserDetails />}
          />
          <Route
            path="/dashboard/review-enrollReq/:id"
            element={<ReviewEnrollReq />}
          />
          <Route
            path="/dashboard/student-progress/:email"
            element={<StudentProgress />}
          />

          {/* Student Routes */}
          <Route path="profile" element={<Profile />} />
          <Route path="student/home" element={<StudentsDashboardHome />} />
          <Route path="student-courses" element={<StudentsCourses />} />
          <Route path="student-assignment" element={<StudentAssignment />} />
          <Route path="student-routine" element={<StudentRoutine />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="grade" element={<Grade />} />
          <Route path="Fee" element={<Fee />} />
          <Route path="studentMaterials" element={<StudentsMaterials />} />
          <Route path="leave-form/:email" element={<LeaveForm />} />
          <Route path="student-idCard/:email" element={<StudentIdCard />} />
          <Route path="enrollment-requests/:email" element={<EnrollmentRequests />} />

          {/* Faculty Routes */}
          <Route>
            <Route path="faculty/home" element={<FacultyDashboard />} />
            <Route path="faculty-courses" element={<FacultyCourses />} />
            <Route
              path="faculty-courses/details/:id"
              element={<CourseDetails />}
            />
            <Route path="faculty-routine" element={<FacultyRoutine />} />
            <Route path="faculty-grades" element={<FacultyGrades />} />
            <Route path="faculty-attendance" element={<FacultyAttendance />} />
            <Route path="assignment" element={<Assignment />} />
            <Route path="add-assignment" element={<CreateAssignment />} />
            <Route path="add-assignment/:id" element={<CreateAssignment />} />
            <Route
              path="assignment-details/:id"
              element={<AssignmentDetails />}
            />
            <Route path="materials" element={<Materials />} />
            <Route path="add-materials" element={<AddMaterials />} />
            <Route path="add-materials/:id" element={<AddMaterials />} />
          </Route>
          {/* message-route */}
          <Route path="message" element={<Message />} />
          {/* dynamic route */}
          <Route path="payment-page" element={<PaymentPage />} />
          <Route path="send-message" element={<SendMessage />} />
          <Route path="sent-box" element={<SentBox />} />
          <Route path="send-message/:id" element={<SendMessage />} />
          <Route path="/dashboard/view-submissions/:assignmentId" element={<ViewSubmissions />} />
        </Route>
      </Route>
      <Route path="*" element={<ErrorPage/>}/>
    </Routes>
  );
};

export default AppRouter;
