import { Link } from "react-router";
import { FaArrowLeft } from "react-icons/fa";

const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-8xl font-bold text-blue-600 drop-shadow-lg mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-600 text-md mb-6 max-w-md">
        Sorry, the page you’re looking for doesn’t exist or has been moved.
        Please check the URL or return to the homepage.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-all shadow"
      >
        <FaArrowLeft /> Back to Dashboard
      </Link>
    </div>
  );
};

export default ErrorPage;
