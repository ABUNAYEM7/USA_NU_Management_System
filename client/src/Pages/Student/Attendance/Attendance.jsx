import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import useUserRole from "../../../Components/Hooks/useUserRole";
import { useNavigate } from "react-router";
import useFetchData from "../../../Components/Hooks/useFetchData";
import StudentsLeaveRequest from "../../../Components/StudnetsLeaveRequest/StudentsLeaveRequest";

const Attendance = () => {
  const { data } = useUserRole();
  const { data: attendanceResponse } = useFetchData(
    `${data?.data?.email}`,
    `/student-assignment/${data?.data?.email}`
  );
  const navigate = useNavigate();

  const records = attendanceResponse?.records || [];


  let presentDays = 0;
  let absentDays = 0;
  let leaveDays = 0;

  records.forEach((record) => {
    if (record.status === "present") presentDays++;
    else if (record.status === "absent") absentDays++;
    else if (record.status === "leave") leaveDays++;
  });

  const totalDays = presentDays + absentDays + leaveDays;

  const presentPercentage =
    totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
  const absentPercentage =
    totalDays > 0 ? ((absentDays / totalDays) * 100).toFixed(2) : 0;
  const leavePercentage =
    totalDays > 0 ? ((leaveDays / totalDays) * 100).toFixed(2) : 0;

  const handleApplyLeave = (email) => {
    navigate(`/dashboard/leave-form/${email}`);
  };

  return (
    <div className="p-6 max-w-11/12 mx-auto">
      <div className="bg-white rounded-2xl shadow p-6 space-y-8">
        <h1 className="text-2xl font-bold text-center">Attendance Report</h1>

        <div className="text-center">
          <p className="text-lg font-semibold">Student: {data?.data?.name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-prime/60 rounded-xl text-center">
            <FaCheckCircle className="text-green-600 text-3xl mx-auto mb-2" />
            <p className="text-lg font-semibold">Present Days</p>
            <p className="text-xl">{presentDays} Days</p>
            <p className="text-sm text-green-800">{presentPercentage}%</p>
          </div>

          <div className="p-4 bg-orange-600/60 rounded-xl text-center">
            <FaTimesCircle className="text-red-600 text-3xl mx-auto mb-2" />
            <p className="text-lg font-semibold">Absent Days</p>
            <p className="text-xl">{absentDays} Days</p>
            <p className="text-sm text-red-800">{absentPercentage}%</p>
          </div>

          <div className="p-4 bg-blue-500/60 rounded-xl text-center">
            <FaCheckCircle className="text-white text-3xl mx-auto mb-2" />
            <p className="text-lg font-semibold text-white">Leave Days</p>
            <p className="text-xl text-white">{leaveDays} Days</p>
            <p className="text-sm text-white">{leavePercentage}%</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="stats stats-vertical lg:stats-horizontal shadow">
            <div className="stat">
              <div className="stat-title">Total Days</div>
              <div className="stat-value">{totalDays}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Present %</div>
              <div className="stat-value text-green-600">
                {presentPercentage}%
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Absent %</div>
              <div className="stat-value text-red-600">
                {absentPercentage}%
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Leave %</div>
              <div className="stat-value text-blue-600">
                {leavePercentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Apply for leave button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => handleApplyLeave(data?.data?.email)}
            className="btn bg-highlight text-white w-full"
          >
            Apply for Leave
          </button>
        </div>


      </div>
    </div>
  );
};

export default Attendance;
