import React from "react";

const CourseWorkflow = () => {
  const steps = [
    {
      number: "1",
      title: "Identify the Task",
      description: "Discuss the tasks to initiate and identify the focus of the session.",
    },
    {
      number: "2",
      title: "Breaking the Task into Parts",
      description: "Provide an opportunity for the tutee to break the task into manageable pieces.",
    },
    {
      number: "3",
      title: "Setting an Agenda",
      description: "Discuss goals; this helps the amount of time necessary to complete each part of their task.",
    },
    {
      number: "4",
      title: "Tutee Summary of Thought Process",
      description: "Have the tutee summarize the process of achieving the type of task.",
    },
  ];

  return (
    <div className="py-10 px-5 md:px-10 lg:px-20">
      <h2 className="text-center text-xl md:text-3xl font-semibold bg-orange-400 inline-block py-1 px-5 rounded-full tracking-wide">
        Our Course Workflow
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 relative">
        {steps.map((step, index) => (
          <div key={index} className="text-center relative flex flex-col items-center">
            <div className="rounded-full border-4 border-dotted border-black bg-orange-400 text-black font-bold h-20 w-20 flex items-center justify-center text-2xl shadow-lg">
              {step.number}
            </div>
            <h3 className="text-lg font-semibold mt-4">{step.title}</h3>
            <p className="mt-2 text-sm px-3 text-gray-600">{step.description}</p>
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-10 right-[-50%] transform translate-x-1/2">
                <svg width="100" height="30" viewBox="0 0 100 30">
                  <path
                    d="M 0 15 Q 50 30 100 15"
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />
                  <polyline
                    points="95,10 100,15 95,20"
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseWorkflow;
