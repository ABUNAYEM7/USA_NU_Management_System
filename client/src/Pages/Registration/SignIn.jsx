import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router";
import loginAnimation from "../../../public/loginAnimation.json"
import Lottie from "lottie-react";
import useAuth from "../../Components/Hooks/useAuth";
import Swal from "sweetalert2";

const SignIn = () => {
  const [show, setShow] = useState(false)
  const [error, setError] = useState("");
  const [submitting,setSubmitting] = useState(false)
  const navigate = useNavigate()

  const {userLogIn} = useAuth()

  const submitHandler = async (e) => {
    e.preventDefault()
    const form = e.target;
    const email = form.email.value;
    const pass = form.pass.value;
      setSubmitting(false)
        try{
          setSubmitting(true)
            await userLogIn(email,pass)
            .then(user=>{
                if(user.user?.email){
                  setSubmitting(false)
                    navigate('/')
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Registration Successful",
                        showConfirmButton: false,
                        timer: 1500
                      });
                      
                }
                    })
        }
        catch(err){
          setSubmitting(false)
            setError(err.message.split('/')[1].split(')')[0] || err.code || 'Invalid Credentials')
        }
  };

  return (
    <div className="hero bg-base-200 min-h-screen mt-12">
      <div className="hero-content w-full flex-col lg:flex-row-reverse justify-between">
        {/* right-container */}
        <div className="w-full md:w-1/2 p-4 my-6">
      <Lottie 
      animationData={loginAnimation} loop={true} />
      </div>
        {/* left-container */}
        <div className="w-full md:w-1/2 p-4 my-6 bg-white rounded-xl ">
          <h3 className="text-center text-4xl font-bold text-highlight">
            Login Now{" "}
          </h3>
          <form onSubmit={submitHandler} className="card-body space-y-6">
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
              <div className="absolute top-5 right-2 p-2 rounded-full  flex items-center justify-center ">
                <button 
                onClick={() => setShow(!show)} type="button">
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
              disabled={submitting}
              className="btn bg-prime text-highlight w-full">
                {
                  submitting ? 'Login ...' : 'Login'
                }
              </button>
            </div>
          </form>

          <p className="text-xl font-medium text-highlight text-center">
            Don't Have An Account ?
            <span className="text-primary ml-3 hover:underline ">
              <Link to={"/signUp"}>Register</Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
