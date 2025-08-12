import React from "react";
import universityImage from "../../assets/university/university.jpg";
import { motion } from "framer-motion";
import { ImLibrary } from "react-icons/im";
import { SiConcourse } from "react-icons/si";
import { GiTeacher } from "react-icons/gi";

const University = () => {
  return (
    <div className="bg-[#54304d] min-h-[600px]">
      <div className="p-6 flex flex-col-reverse lg:flex-row lg:items-center overflow-hidden">
        {/* Left Side - Information */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2 p-4"
        >
          <h3 className="text-[#fff9f9] text-xl md:text-3xl lg:text-5xl font-medium text-center">
            Welcome To University of Education
          </h3>
          <div className="divider"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {/* library */}
            <div className="card max-w-96 p-2 group cursor-pointer relative overflow-hidden bg-transparent">
              <figure className="relative z-10">
                <ImLibrary
                  size={100}
                  className="group-hover:drop-shadow-[0_5px_15px_rgba(255,255,255,0.5)] transition duration-300"
                />
              </figure>
              <div className="card-body text-white relative z-10">
                <h2 className="card-title group-hover:text-orange-500 transition duration-300">
                  BOOKS & LIBRARY
                </h2>
                <p>
                  World's largest books and library center is here where you can
                  study the latest trends in education.
                </p>
                <div className="relative">
                  <img
                    src={universityImage}
                    alt="universityImage"
                    className="rounded-lg"
                  />
                  <div className="absolute inset-0 bg-orange-500 bg-opacity-50 opacity-0 group-hover:opacity-60 flex items-center justify-center transition duration-300 rounded-lg">
                    <span className="text-white text-xl font-semibold">
                      Learn Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Learn Courses  */}
            <div className="card max-w-96 p-2 group cursor-pointer relative overflow-hidden bg-transparent">
              <figure className="relative z-10">
                <SiConcourse
                  size={100}
                  className="group-hover:drop-shadow-[0_5px_15px_rgba(255,255,255,0.5)] transition duration-300"
                />
              </figure>
              <div className="card-body text-white relative z-10">
                <h2 className="card-title group-hover:text-orange-500 transition duration-300">
                  Learn Courses
                </h2>
                <p>
                Join our Learn Courses to gain new skills, advance your knowledge, and achieve your goals with expert guidance!
                </p>
                <div className="relative">
                  <img
                    src={universityImage}
                    alt="universityImage"
                    className="rounded-lg"
                  />
                  <div className="absolute inset-0 bg-orange-500 bg-opacity-50 opacity-0 group-hover:opacity-60 flex items-center justify-center transition duration-300 rounded-lg">
                    <span className="text-white text-xl font-semibold">
                      Learn Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Become a Instr */}
            <div className="card max-w-96 p-2 group cursor-pointer relative overflow-hidden bg-transparent">
              <figure className="relative z-10">
                <GiTeacher
                  size={100}
                  className="group-hover:drop-shadow-[0_5px_15px_rgba(255,255,255,0.5)] transition duration-300"
                />
              </figure>
              <div className="card-body text-white relative z-10">
                <h2 className="card-title group-hover:text-orange-500 transition duration-300">
                Become a Instr
                </h2>
                <p>
                Become an instructor and share your expertise. Join our Learn Course to master teaching strategies and inspire learners!
                </p>
                <div className="relative">
                  <img
                    src={universityImage}
                    alt="universityImage"
                    className="rounded-lg"
                  />
                  <div className="absolute inset-0 bg-orange-500 bg-opacity-50 opacity-0 group-hover:opacity-60 flex items-center justify-center transition duration-300 rounded-lg">
                    <span className="text-white text-xl font-semibold">
                      Learn Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Logo and Images */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2"
        >
          <img
            className="min-h-[600px] rounded-3xl"
            src={universityImage}
            alt="university Image"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default University;
