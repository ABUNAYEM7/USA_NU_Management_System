import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay"; // Ensure Autoplay styles are imported
import { Pagination, Autoplay } from "swiper/modules"; // Import Autoplay module
import image1 from "../../assets/bannerImage1.jpg";
import image2 from "../../assets/banner2.jpg";
import image3 from "../../assets/banner3.jpg";
import image4 from "../../assets/bannerImage4.jpeg";
import KeyFeatures from "../../Components/Features/KeyFeatures";
import SimpleSteps from "../../Components/SimpleSteps/SimpleSteps";
import ContactUs from "../../Components/ContactUs/ContactUs";
import SmartCampus from "../../Components/SmartCampus/SmartCampus";
import University from "../../Components/Universilty/University";
import OurGallery from "../../Components/OurGallery/OurGallery";
import OurCourses from "../../Components/OurCourses/OurCourses";
import { Link, useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate()
  const slides = [
    {
      image: image2,
      heading: "Welcome to Student Management",
      description:
        "Manage student records effortlessly with our innovative platform, offering seamless enrollment, attendance, and performance tracking in a secure and user-friendly system.",
    },
    {
      image: image3,
      heading: "Track Academic Performance",
      description:
        "Easily monitor grades, attendance, and progress in real-time with our secure, user-friendly system, ensuring accurate tracking, seamless management, and improved student performance.",
    },
    {
      image: image4,
      heading: "Efficient Communication",
      description:
        "Keep students, teachers, and parents connected effortlessly with our seamless communication platform, ensuring collaboration, real-time updates, and improved academic engagement.",
    },
  ];

  const enrolledHandler=()=>{
    navigate(`/academic`)
  }

  return (
    <div className="mt-[90px]">
      {/* banner */}
<div className="relative h-[600px] w-full">
  <Swiper
    pagination={{ clickable: true }}
    modules={[Pagination, Autoplay]}
    autoplay={{ delay: 3000, disableOnInteraction: false }}
    className="h-full"
  >
    {slides.map((slide, index) => (
      <SwiperSlide key={index} className="relative h-full">
        <img
          className="h-full w-full object-cover object-center"
          src={slide.image}
          alt={`Slide ${index + 1}`}
        />

        {/* Optional overlay if needed */}
        {/* <div className="absolute inset-0 bg-black bg-opacity-30"></div> */}

        <div className="absolute inset-y-0 left-10 flex flex-col justify-center
                        sm:left-6 sm:px-4
                        xs:left-4 xs:px-2 xs:max-w-[90vw] xs:inset-y-auto xs:bottom-10">
          <h1 className="text-black text-4xl sm:text-3xl xs:text-2xl font-bold drop-shadow-lg max-w-[90vw]">
            {slide.heading}
          </h1>
          <p className="text-black mt-4 drop-shadow-md sm:text-sm xs:text-xs max-w-[50vw]">
            {slide.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={enrolledHandler}
              className="btn w-fit text-white bg-orange-600 border-none hover:bg-white hover:border-2 hover:text-orange-600 hover:border-orange-600 px-4 py-2 text-sm sm:text-xs"
            >
              Enroll Now
            </button>
            <Link
              to={"/aboutPage"}
              className="btn w-fit text-highlight border-2 border-highlight bg-transparent px-4 py-2 text-sm sm:text-xs"
            >
              Learn More
            </Link>
          </div>
        </div>
      </SwiperSlide>
    ))}
  </Swiper>
</div>

      {/* university-section */}
      <section>
        <University />
      </section>
      {/* smartCamp-section */}
      <section>
        <SmartCampus />
      </section>
      {/* OurGallery-section */}
      <section className="my-12 p-4">
        <OurGallery />
      </section>
      {/* OurCourses section */}
      <section className="my-12 p-4">
        <OurCourses />
      </section>
      {/* features-section */}
      <section>
        <KeyFeatures />
      </section>
      {/* SimpleSteps-section */}
      <section className="my-12 p-4">
        <SimpleSteps />
      </section>
      {/* contact us-section */}
      <section className="my-12 p-4">
        <ContactUs />
      </section>
    </div>
  );
};

export default Home;
