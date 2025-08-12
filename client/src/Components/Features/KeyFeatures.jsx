import React from "react";

const KeyFeatures = () => {
  const features = [
    {
      title: "Student Portal",
      description:
        "Course enrollment, grade tracking, fee payment, and academic records management.",
      color: "#1f4a99",
    },
    {
      title: "Faculty Dashboard",
      description:
        "Attendance management, grade submission, course materials, and student tracking.",
      color: "#01cde5",
    },
    {
      title: "Admin Console",
      description:
        "Complete system management, user administration, and institutional reporting.",
      color: "#BA6B71",
    },
  ];

  return (
    <div className="bg-[#9fdee8] p-12">
      <h3 className="text-highlight text-3xl md:text-4xl lg:text-5xl font-black text-center">
        Key Features
      </h3>
      <p className="text-sm font-medium w-11/12 md:w-2/3 mx-auto text-center mt-3">
        Our platform offers essential tools for a seamless experience, including
        easy course enrollment, progress tracking, and secure payment
        integration. Designed for students, faculty, and admins, it provides a
        user-friendly interface to manage academic journeys, engage with
        materials, and track performance effectively.
      </p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
        {features.map((f, i) => (
          <div
            key={i}
            className="group relative overflow-hidden card max-w-96 shadow-xl"
            style={{ backgroundColor: f.color }}
          >
            <div className="card-body text-white relative z-10">
              <h2 className="card-title">{f.title}</h2>
              <p>{f.description}</p>
            </div>

            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-70 transition-opacity duration-300 z-20"
              style={{ backgroundColor: f.color }}
            ></div>

            {/* Animated Button */}
            <button className="absolute bottom-[-50px] group-hover:bottom-1/2 group-hover:translate-y-1/2 left-1/2 -translate-x-1/2 z-30 btn btn-outline btn-wide transition-all duration-500 ease-in-out">
              Explore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyFeatures;
