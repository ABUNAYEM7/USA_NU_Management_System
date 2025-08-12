import React from "react";
import { FaUser, FaRegCheckCircle, FaChalkboardTeacher, FaRocket } from "react-icons/fa";

const SimpleSteps = () => {
  const stepsSections = [
    {
      title: "Inter",
      description:
        "Get started by exploring the platform and understanding how it works. This introductory step will familiarize you with the main features and functionality.",
      icon: <FaRegCheckCircle size={50} className="text-highlight" />,
      hoverColor: "#1f4a99",
    },
    {
      title: "Register",
      description:
        "Create your account by signing up with your email or through third-party logins. This is your gateway to accessing personalized features.",
      icon: <FaUser size={50} className="text-highlight" />,
      hoverColor: "#ba6b71",
    },
    {
      title: "Enroll",
      description:
        "Sign up for courses or programs that interest you. Choose the right options to get started with the academic content or services.",
      icon: <FaChalkboardTeacher size={50} className="text-highlight" />,
      hoverColor: "#6bba71",
    },
    {
      title: "Start",
      description:
        "Begin your learning journey or use the platform’s services. Start exploring all the features available to you, from course materials to additional tools.",
      icon: <FaRocket size={50} className="text-highlight" />,
      hoverColor: "#eab308",
    },
  ];

  return (
    <div>
      <h3 className="text-[#243c5a] text-3xl md:text-4xl lg:text-5xl font-black text-center">
        Simple Steps To Start
      </h3>
      <p className="text-sm font-medium w-11/12 md:w-2/3 mx-auto text-center mt-3">
        Embark on your journey with our detailed, step-by-step guide that walks
        you through every essential process—from signing up and personalizing
        your profile to exploring key features. Our comprehensive guide ensures
        you get up and running quickly, making it easy to maximize your
        experience on our platform.
      </p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center">
        {stepsSections.map((step, i) => (
          <div
            key={i}
            className="group relative overflow-hidden card bg-white max-w-[350px] shadow-xl"
          >
            {/* Animated Overlay */}
            <div
              className="absolute inset-0 w-0 group-hover:w-full transition-all duration-500 ease-out"
              style={{ backgroundColor: step.hoverColor }}
            ></div>

            <figure className="relative z-10 pt-6">{step.icon}</figure>
            <div className="card-body relative z-10">
              <h2 className="card-title group-hover:text-white transition-colors duration-300">
                {step.title}
              </h2>
              <p className="group-hover:text-white transition-colors duration-300">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleSteps;
