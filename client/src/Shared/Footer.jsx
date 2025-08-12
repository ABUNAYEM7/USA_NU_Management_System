import React from "react";
import logo from "../assets/logo.jpg"

const Footer = () => {
  return (
    <footer className="w-full footer sm:footer-horizontal bg-prime/60 backdrop-blur-md text-base-content lg:p-10 md:p-6 p-3 ">
      <aside>
        <img 
        className="w-16 h-16 rounded-full"
        src={logo} alt="logo" />
        <h3 className="text-xl md:text-2xl ">
          USA NATIONAL UNIVERSITY
        </h3>
      </aside>
      <nav>
        <h6 className="footer-title">Services</h6>
        <a className="link link-hover">Branding</a>
        <a className="link link-hover">Design</a>
        <a className="link link-hover">Marketing</a>
        <a className="link link-hover">Advertisement</a>
      </nav>
      <nav>
        <h6 className="footer-title">Company</h6>
        <a className="link link-hover">About us</a>
        <a className="link link-hover">Contact</a>
        <a className="link link-hover">Jobs</a>
        <a className="link link-hover">Press kit</a>
      </nav>
      <nav>
        <h6 className="footer-title">Legal</h6>
        <a className="link link-hover">Terms of use</a>
        <a className="link link-hover">Privacy policy</a>
        <a className="link link-hover">Cookie policy</a>
      </nav>
    </footer>
  );
};

export default Footer;
