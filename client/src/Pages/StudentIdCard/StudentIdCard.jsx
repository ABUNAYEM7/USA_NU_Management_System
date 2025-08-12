import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import AxiosSecure from "../../Components/Hooks/AxiosSecure";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import signature from "../../../public/S.png"

const StudentIdCard = () => {
  const { email } = useParams();
  const axiosInstance = AxiosSecure();
  const [student, setStudent] = useState(null);
  const cardRef = useRef();

  useEffect(() => {
    if (!email) return;

    const fetchStudent = async () => {
      try {
        const res = await axiosInstance.get(`/student/${email}`);
        setStudent(res.data);
      } catch (err) {
        console.error("Error fetching student info:", err);
      }
    };

    fetchStudent();
  }, [email, axiosInstance]);

  const isProfileComplete = (student) => {
    return (
      student?.name &&
      student?.email &&
      student?.studentId &&
      student?.countryCode &&
      student?.contactNumber &&
      student?.bloodGroup &&
      student?.department &&
      student?.photo
    );
  };

const handleDownload = async () => {
  const node = cardRef.current;
  if (!node) return;

  const clone = node.cloneNode(true);

  const sanitizeColors = (element) => {
    const computedStyle = window.getComputedStyle(element);
    ["color", "backgroundColor", "borderColor", "boxShadow"].forEach((prop) => {
      const value = computedStyle[prop];
      if (value && value.includes("oklch")) {
        element.style[prop] = "#000";
      }
    });

    if (element.hasAttribute("style")) {
      const clean = element
        .getAttribute("style")
        .replace(/oklch\([^\)]+\)/g, "#000");
      element.setAttribute("style", clean);
    }

    Array.from(element.children).forEach(sanitizeColors);
  };

  sanitizeColors(clone);

  // Stack front and back vertically
  const cardChildren = clone.children;
  if (cardChildren.length === 2) {
    clone.style.display = "flex";
    clone.style.flexDirection = "column";
    clone.style.alignItems = "center";
    clone.style.gap = "12px";
  }

  const hiddenContainer = document.createElement("div");
  hiddenContainer.style.position = "fixed";
  hiddenContainer.style.top = "-9999px";
  hiddenContainer.style.left = "-9999px";
  hiddenContainer.style.zIndex = "-9999";
  hiddenContainer.style.backgroundColor = "#fff";
  hiddenContainer.appendChild(clone);
  document.body.appendChild(hiddenContainer);

  try {
    const canvas = await html2canvas(clone, {
      useCORS: true,
      scale: 2,
      backgroundColor: "#fff",
    });

    const imgData = canvas.toDataURL("image/png");

    // Convert canvas size from px to pt (1px = 0.75pt)
    const canvasWidthPt = canvas.width * 0.75;
    const canvasHeightPt = canvas.height * 0.75;

    // Create PDF slightly larger than canvas for margins
    const pdf = new jsPDF("p", "pt", [canvasWidthPt + 40, canvasHeightPt + 40]);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate centered position
    const xOffset = (pageWidth - canvasWidthPt) / 2;
    const yOffset = (pageHeight - canvasHeightPt) / 2;

    pdf.addImage(imgData, "PNG", xOffset, yOffset, canvasWidthPt, canvasHeightPt);
    pdf.save(`${student?.name || "student"}-ID-Card.pdf`);
  } catch (error) {
    console.error("PDF export failed:", error);
  } finally {
    document.body.removeChild(hiddenContainer);
  }
};


  if (!student)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading student ID card...</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center py-10 bg-white min-h-screen space-y-6">
<div ref={cardRef} className="flex flex-col items-center font-sans text-[10px] gap-4">

      {/* FRONT SIDE */}
      <div className="w-[159px] h-[242px] bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300">
        {/* Header */}
        <div className="bg-[#baf2d1] flex items-center gap-1 p-1">
          <img
            src="https://i.ibb.co/4RhNKpj4/images.png"
            alt="logo"
            className="w-6 h-6 rounded-full border border-white"
          />
          <h1 className="text-[8px] text-black font-semibold">Kings International Institute</h1>
        </div>

        {/* Photo */}
        <div className="flex flex-col items-center mt-2">
          <div className="w-14 h-14 clip-hexagon overflow-hidden shadow border-2 border-white">
            <img
              src={student?.photo || "https://i.ibb.co/2K2tkj1/default-avatar.png"}
              alt="student"
              className="object-cover w-full h-full"
            />
          </div>
          <h2 className="text-[10px] font-bold mt-1 text-center text-gray-800">
            {student?.name || "N/A"}
          </h2>
          <p className="text-[8px] text-gray-600 text-center">
            {student?.department || "Department"}
          </p>
        </div>

        {/* Info */}
        <div className="px-2 py-1 mt-1 text-[7px] text-gray-700 space-y-[2px]">
          <p><span className="font-semibold">ID No:</span> {student?.studentId || "N/A"}</p>
          <p><span className="font-semibold">Phone:</span> {`${student?.countryCode || ""} ${student?.contactNumber || "N/A"}`}</p>
          <p className="font-normal text-[5px]"><span className="font-normal text-[8px]">Email:</span> {student?.email || "N/A"}</p>
          <p><span className="font-semibold">Blood:</span> {student?.bloodGroup || "N/A"}</p>
        </div>

        {/* Footer */}
        <div className="text-center text-[6px] text-gray-500 px-2 mt-1">
          This ID must be carried at all times on campus premises.
        </div>
      </div>

      {/* BACK SIDE */}
      <div className="w-[159px] h-[242px] bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300 flex flex-col justify-between">
        {/* Header */}
        <div className="bg-[#baf2d1] flex items-center gap-1 p-1">
          <img
            src="https://i.ibb.co/4RhNKpj4/images.png"
            alt="logo"
            className="w-6 h-6 rounded-full border border-white"
          />
          <h1 className="text-[8px] text-black font-semibold">Kings International Institute</h1>
        </div>

        {/* Terms */}
        <div className="px-2 mt-1 text-[6.5px] text-gray-700 space-y-[2px]">
          <p>This card remains the property of USA National University.</p>
          <p>Non-transferable; show upon request.</p>
          <p>Loss should be reported to the admin immediately.</p>
          <p>Forgery or misuse will lead to disciplinary action.</p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-2 pb-2">
          <p className="text-[6.5px]">
            <span className="font-semibold">Issued:</span> {student?.createdAt?.split('T')[0] || "01/01/2025"}
          </p>
          <div className="flex flex-col items-center">
            <img
              src={`${signature}`}
              alt="signature"
              className="w-10 h-4 object-contain"
            />
            <span className="text-[5.5px]">Authorized</span>
          </div>
        </div>
      </div>

      {/* Clip-path style */}
      <style>
        {`
          .clip-hexagon {
            clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
          }
        `}
      </style>
    </div>

      <button
        onClick={handleDownload}
        disabled={!isProfileComplete(student)}
        className={`mt-6 px-6 py-2 rounded transition-all ${
          isProfileComplete(student)
            ? "bg-blue-700 text-white hover:bg-blue-800"
            : "bg-gray-400 text-white cursor-not-allowed"
        }`}
      >
        Download ID Card
      </button>

      {!isProfileComplete(student) && (
        <p className="text-sm text-red-600 font-medium mt-2">
          Please update your profile to download the Student ID.
        </p>
      )}
    </div>
  );
};

export default StudentIdCard;
