import axios from "axios";
import { useNavigate } from "react-router";
import useAuth from "./useAuth";

// ✅ Shared instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let interceptorAttached = false;

const AxiosSecure = () => {
  const { userLogOut } = useAuth();
  const navigate = useNavigate();

  if (!interceptorAttached) {
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          userLogOut()
            .then(() => {
              navigate("/signIn");
            })
            .catch((err) => {
              if (process.env.NODE_ENV === "development") {
                console.error("Logout failed:", err);
              }
            });
        }
        return Promise.reject(error);
      }
    );
    interceptorAttached = true;
  }

  return axiosInstance;
};

export default AxiosSecure;
