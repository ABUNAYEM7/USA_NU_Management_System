import React from "react";
import { useNavigate } from "react-router";
import useAuth from "../../Components/Hooks/useAuth";

const departmentData = [
  {
    title: "Bachelor of Science in Business Administration",

    level: "Bachelor Program",

    description:
      "Learn business strategies, marketing, management, and finance to prepare for leadership roles in the corporate world.",

    color: "bg-blue-100",
  },

  {
    title: "Bachelor of Science in Civil Engineering",

    level: "Bachelor Program",

    description:
      "Develop foundational knowledge in structural design, materials, and project management to build the future.",

    color: "bg-green-100",
  },

  {
    title: "Bachelor of Science in Computer Science",

    level: "Bachelor Program",

    description:
      "Gain hands-on experience in programming, algorithms, and software systems to innovate in tech industries.",

    color: "bg-yellow-100",
  },

  {
    title: "Bachelor of Science in Information System Management",

    level: "Bachelor Program",

    description:
      "Bridge the gap between business and technology with skills in system analysis, IT infrastructure, and data management.",

    color: "bg-indigo-100",
  },

  {
    title: "Bachelor of Health and Social Care Management",

    level: "Bachelor Program",

    description:
      "Gain knowledge in community health, disease prevention, and health promotion to improve public health outcomes.",

    color: "bg-teal-100",
  },

  {
    title: "Bachelor of Hospitality and Tourism Management",

    level: "Bachelor Program",

    description:
      "Gain knowledge in community health, disease prevention, and health promotion to improve Hospitality and Tourism outcomes.",

    color: "bg-teal-100",
  },

  {
    title: "Master of Health and Social Care Management",

    level: "Master Program",

    description:
      "Advance your expertise in healthcare systems, epidemiology, and public health policy for impactful community leadership.",

    color: "bg-pink-100",
  },

  {
    title: "Master of Science in Civil Engineering",

    level: "Master Program",

    description:
      "Specialize in advanced topics like geotechnical, structural, and environmental engineering for high-level projects.",

    color: "bg-teal-100",
  },

  {
    title: "Master of Science in Business Administration",

    level: "Master Program",

    description:
      "Sharpen your strategic thinking and leadership abilities for executive and managerial roles across industries.",

    color: "bg-red-100",
  },

  {
    title: "Masters of Science in Information System Management",

    level: "Master Program",

    description:
      "Explore cutting-edge fields like AI, machine learning, and cybersecurity for future-ready tech careers.",

    color: "bg-purple-100",
  },

  {
    title: "Master of Hospitality and Tourism Management",

    level: "Master Program",

    description:
      "Gain knowledge in community health, disease prevention, and health promotion to improve Hospitality and Tourism outcomes.",

    color: "bg-teal-100",
  },

  {
    title: "Doctor of Business Management",

    level: "Doctorate Program",

    description:
      "Drive innovation and research in business theories, strategies, and global market practices at the highest academic level.",

    color: "bg-orange-100",
  },

  {
    title: "Doctor of Health and Social Care Management",

    level: "Doctorate Program",

    description:
      "Lead health initiatives and policy development through evidence-based public health research and advocacy.",

    color: "bg-lime-100",
  },

  {
    title: "Doctor of Science in Computer Science",

    level: "Doctorate Program",

    description:
      "Conduct impactful research in computer science, contributing to breakthroughs in computing and technology.",

    color: "bg-blue-200",
  },

  {
    title: "Doctor of Management",

    level: "Doctorate Program",

    description:
      "Focus on applied research in leadership, organizational change, and strategic decision-making.",

    color: "bg-teal-200",
  },

  {
    title: "Doctor of Hospitality and Tourism Management",

    level: "Doctor Program",

    description:
      "Gain knowledge in community health, disease prevention, and health promotion to improve Hospitality and Tourism outcomes.",

    color: "bg-teal-100",
  },

  {
    title: "English as a Second Language",

    level: "Associate Program",

    description:
      "Develop English fluency in speaking, listening, reading, and writing for academic and professional settings.",

    color: "bg-pink-200",
  },
];

const Academic = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEnroll = (departmentName) => {
    if (user?.email) {
      navigate("/enroll", {
        state: { program: departmentName },
      });
    } else {
      navigate("/signUp", {
        state: { enrolledRequested: departmentName, redirectTo: "/enroll" },
      });
    }
  };

  return (
    <div className="mt-20 px-4 py-8 bg-base-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-highlight">
        Our Academic Programs
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {departmentData.map((dept, index) => (
          <div
            key={index}
            className={`card border border-base-300 ${dept.color} shadow-xl`}
          >
            <div className="card-body">
              <h2 className="card-title text-lg text-accent">{dept.title}</h2>
              <p className="text-sm text-gray-600">{dept.description}</p>
              <div className="mt-2">
                <span className="badge badge-outline text-highlight">
                  {dept.level}
                </span>
              </div>
              <div className="mt-4 text-right">
                <button
                  className="btn btn-sm btn-accent"
                  onClick={() => handleEnroll(dept.title)}
                >
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Academic;
