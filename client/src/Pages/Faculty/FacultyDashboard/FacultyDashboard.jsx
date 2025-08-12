import React from 'react';
import { FaBookOpen, FaUsers, FaClipboardCheck, FaRegCalendarAlt } from 'react-icons/fa';
import useFetchData from '../../../Components/Hooks/useFetchData';
import useAuth from '../../../Components/Hooks/useAuth';

const FacultyDashboard = () => {
  const {user} = useAuth();
  const email = user?.email
  const {data : states} = useFetchData(`${email}`,`/faculty-dashboard/state/${email}`)
  const dashboardItems = [
    {
      title: 'Courses',
      count: states?.totalCourses
      ,
      icon: <FaBookOpen size={30} />,
      color: 'bg-blue-500',
    },
    {
      title: 'Students',
      count: states?.totalStudents
      ,
      icon: <FaUsers size={30} />,
      color: 'bg-green-500',
    },
    {
      title: 'Assignments',
      count: states?.totalAssignments,
      icon: <FaClipboardCheck size={30} />,
      color: 'bg-yellow-500',
    },
    {
      title: 'Upcoming Events',
      count: 5,
      icon: <FaRegCalendarAlt size={30} />,
      color: 'bg-red-500',
    },
  ];
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-[#243c5a] mb-8 ">Faculty Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardItems.map((item, index) => (
          <div key={index} className={`card ${item.color} text-white shadow-xl`}> 
            <div className="card-body flex-row items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold">{item.count}</h2>
                <p className="font-medium">{item.title}</p>
              </div>
              <div>{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Activities Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Upcoming Activities</h2>

          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Activity</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Grade Submission</td>
                  <td>April 15, 2025</td>
                  <td><span className="badge badge-success">Pending</span></td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Faculty Meeting</td>
                  <td>April 18, 2025</td>
                  <td><span className="badge badge-warning">Scheduled</span></td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Course Evaluation</td>
                  <td>April 20, 2025</td>
                  <td><span className="badge badge-info">In Progress</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;