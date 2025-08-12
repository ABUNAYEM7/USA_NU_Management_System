import React from 'react';

const StudentsProfileStats = ({ attendance, grades, courses }) => {
  return (
    <div className='mt-6 p-4 bg-base-100 rounded-lg shadow-lg overflow-auto'>
      <h3 className='text-xl md:text-3xl font-black text-center mb-6'>
        Student Profile Stats
      </h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
        {/* Attendance */}
        <div className='flex flex-col items-center'>
          <div
            className='radial-progress text-primary'
            style={{ '--value': attendance, '--size': '6rem', '--thickness': '0.6rem' }}
          >
            {attendance}%
          </div>
          <span className='mt-2 text-lg font-semibold'>Attendance</span>
        </div>

        {/* Grades */}
        <div className='flex flex-col items-center'>
          <div
            className='radial-progress text-secondary'
            style={{ '--value': grades, '--size': '6rem', '--thickness': '0.6rem' }}
          >
            {grades}%
          </div>
          <span className='mt-2 text-lg font-semibold'>Grades</span>
        </div>

        {/* Courses */}
        <div className='flex flex-col items-center sm:col-span-2 md:col-span-1'>
          <div
            className='radial-progress text-accent'
            style={{ '--value': courses, '--size': '6rem', '--thickness': '0.6rem' }}
          >
            {courses}%
          </div>
          <span className='mt-2 text-lg font-semibold'>Courses Completed</span>
        </div>
      </div>
    </div>
  );
};

export default StudentsProfileStats;
