import React from "react";
import image1 from "../../assets/university/image1.jpg"
import image2 from "../../assets/university/image2.jpg"
import image3 from "../../assets/university/image3.jpg"
import image4 from "../../assets/university/image4.jpg"
import image5 from "../../assets/university/image5.jpg"
import image6 from "../../assets/university/image6.jpg"
import image7 from "../../assets/university/image7.jpg"
import image8 from "../../assets/university/image8.avif"

const OurGallery = () => {
  return (
    <div className="px-4 md:px-10 lg:px-20 py-10">
      <h3 className="text-[#54304d] text-xl md:text-3xl lg:text-5xl font-medium text-center tracking-widest">
        Our Gallery
      </h3>
      <p className="mt-3 text-base font-light tracking-wider text-center">
        Student gallery of the year past graduated passouts
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-4">
          <img className="rounded-lg object-cover h-full w-full" src={image1} alt="gallery-1" />
          <img className="rounded-lg object-cover h-full w-full" src={image2} alt="gallery-2" />
        </div>
        <div className="grid gap-4">
          <img className="rounded-lg object-cover h-full w-full" src={image3} alt="gallery-3" />
          <img className="rounded-lg object-cover h-full w-full" src={image4} alt="gallery-4" />
          <img className="rounded-lg object-cover h-full w-full" src={image5} alt="gallery-5" />
        </div>
        <div className="grid gap-4">
          <img className="rounded-lg object-cover h-full w-full"src={image6} alt="gallery-6" />
          <img className="rounded-lg object-cover h-full w-full" src={image7} alt="gallery-7" />
          <img className="rounded-lg object-cover h-full w-full" src={image8} alt="gallery-8" />
        </div>
      </div>
    </div>
  );
};

export default OurGallery;
