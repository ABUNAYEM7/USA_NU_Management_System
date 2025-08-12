import React from 'react';
import campusImage from "../../assets/campus.jpg";
import { motion } from 'framer-motion';

const SmartCampus = () => {
  return (
    <div className='bg-[#fff9f9]'>
      <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-5 overflow-hidden">
        {/* Left Side - Images */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className='w-full lg:w-1/2'
        >
          <img className='rounded-3xl' src={campusImage} alt="campus Image" />
        </motion.div>

        {/* Right Side - Information */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className='w-full lg:w-1/2 p-4'
        >
          <h3 className='text-[#54304d] text-xl md:text-3xl lg:text-5xl font-medium text-center'>Smart Campus</h3>
          <p className='text-lg mt-3 text-[#54304d]'>
            The Smart Campus is a fully customized Education Management System Solution that can meet all your needs, from academic to complex ERP-related challenges. We have designed our solution so that it can be adopted module-wise. Recently, Our Solution adopted the OBE (outcome-based education) module. We strongly believe our Smart Campus can help your university monitor, maintain, and optimize its academic work and interactions with stakeholders more efficiently.
          </p>
          <div className='flex flex-col gap-3 mt-3'>
            <div className='flex items-center gap-2'>
              <h3 className='text-lg  font-semibold text-[#54304d]'>Smart Admission :</h3>
              <p className='text-base  font-medium'>Apply anytime, anywhere with our easy-to-use system</p>
            </div>
            <div className='flex items-center gap-2'>
              <h3 className='text-lg  font-semibold text-[#54304d] flex it'>Smart Registration Process:</h3>
              <p className='text-base  font-medium'>Student registration that saves you time and money</p>
            </div>
            <div className='flex items-center gap-2'>
              <h3 className='text-lg  font-semibold text-[#54304d]'>Smart Controller Office:</h3>
              <p className='text-base  font-medium'>Reduce manpower and effort</p>
            </div>
            <div className='flex items-center gap-2'>
              <h3 className='text-lg  font-semibold text-[#54304d]'>Smart Accounts:</h3>
              <p className='text-base  font-medium'>Student billing with the core accounts module</p>
            </div>
            <div className='flex items-center gap-2'>
              <h3 className='text-lg  font-semibold text-[#54304d]'>Smart Administration:</h3>
              <p className='text-base  font-medium'>Smart administration dashboards and reports</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SmartCampus;
