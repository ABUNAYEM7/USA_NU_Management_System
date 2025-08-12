import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import registrationAnimation from "../../../public/registrationAnimation.json";
import Lottie from "lottie-react";
import useAuth from "../../Components/Hooks/useAuth";
import Swal from "sweetalert2";
import { getImageUrl } from "../../utility/getImageUrl";
import axios from "axios";
import Auth from "../../Firebase/firebase";

const SignUp = () => {
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const { registerUser, updateUserProfile } = useAuth();

  //   form-submitHandler
  const submitHandler = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const imageFile = form.image.files[0];
    const email = form.email.value;
    const pass = form.pass.value;

    // Reset error before validation
    setError("");
    setSubmitting(true);

    if (pass.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSubmitting(false);
      return;
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(pass)) {
      setError("Password must contain at least one uppercase letter.");
      setSubmitting(false);
      return;
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(pass)) {
      setError("Password must contain at least one lowercase letter.");
      setSubmitting(false);
      return;
    }

    // Check for at least one number
    if (!/\d/.test(pass)) {
      setError("Password must contain at least one number.");
      setSubmitting(false);
      return;
    }

    if (imageFile) {
      const formdata = new FormData();
      formdata.append("image", imageFile);
      var photo = await getImageUrl(formdata);
    }

    // If all validations pass, proceed
    // setError("");
    try {
      // user registration
      await registerUser(email, pass).then(async (user) => {
        if (user.user?.email) {
          const updatedData = {
            displayName: name,
            photoURL: photo,
          };
          // username and photo updated
          await updateUserProfile(updatedData).then(async () => {
            await Auth.currentUser.reload();
            const userData = {
              name,
              photo,
              email,
              role: "user",
            };
            // post data in db
            const res = await axios.post(
              `http://localhost:3000/users`,
              userData
            );
            if (res?.data?.insertedId) {
              setSubmitting(false);
              navigate("/");
              Swal.fire({
                position: "center",
                icon: "success",
                title: "SignIn Successful",
                showConfirmButton: false,
                timer: 1500,
              });
            }
          });
        }
      });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.log(err);
      }
      setError(err.message.split("/")[1] || err.code || "Invalid Credentials");
          setSubmitting(false)
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen mt-20">
      <div className="hero-content w-full flex-col lg:flex-row-reverse justify-between">
        {/* right-container */}
        <div className="w-full md:w-1/2 p-4 my-6">
          <Lottie
            style={{ height: "500px", width: "100%" }}
            animationData={registrationAnimation}
            loop={true}
          />
        </div>
        {/* left-container */}
        <div className="w-full md:w-1/2 p-4 my-6 bg-white rounded-xl ">
          <h3 className="text-center text-4xl font-bold text-highlight">
            Register Now
          </h3>
          <form onSubmit={submitHandler} className="card-body space-y-6">
            {/* User Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name *</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="Name"
                className="input input-bordered w-full"
                required
              />
            </div>
            {/* User photo */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Upload Image *</span>
              </label>
              <input
                name="image"
                type="file"
                className="file-input file-input-accent w-full"
                required
              />
            </div>
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email *</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Password */}
            <div className="form-control relative">
              <label className="label">
                <span className="label-text ">Password</span>
              </label>
              <input
                name="pass"
                type={show ? "text" : "password"}
                placeholder="Password"
                className="input input-bordered w-full"
                required
              />
              {/* Password Toggle */}
              <div className="absolute top-5 right-2 p-2 rounded-full  flex items-center justify-center">
                <button onClick={() => setShow(!show)} type="button">
                  {show ? (
                    <FaEye className="text-black" size={20} />
                  ) : (
                    <FaEyeSlash className="text-black" size={20} />
                  )}
                </button>
              </div>

              <label className="label">
                <a href="#" className="label-text-alt link link-hover">
                  Forgot password?
                </a>
              </label>
            </div>
            {error && (
              <label className="label">
                <p className="text-base font-bold text-red-600">{error}</p>
              </label>
            )}

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn bg-prime text-highlight w-full"
                disabled={submitting}
              >
                {submitting ? "Submitting" : "Submit"}
              </button>
            </div>
          </form>

          <p className="text-xl font-medium text-highlight text-center">
            Already Have An Account ?
            <span className="text-primary ml-3 hover:underline ">
              <Link to={"/signIn"}>SignIn</Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
