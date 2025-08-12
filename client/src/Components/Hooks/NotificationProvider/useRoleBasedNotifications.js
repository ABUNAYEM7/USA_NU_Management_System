import { useEffect } from "react";
import socket from "../useSocket";
import { useNotification } from "./NotificationProvider";
import AxiosSecure from "../AxiosSecure";
import { useQuery } from "@tanstack/react-query";


const useRoleBasedNotifications = (email,userRole) => {
  const { setNotifications } = useNotification();
  const axiosInstance = AxiosSecure();

  const isFaculty = userRole === "faculty";
  const isStudent = userRole === "student";
  const isAdmin = userRole === "admin";
  // Choose endpoint based on role
  let endpoint = "";
  if (isFaculty && email) {
    endpoint = `/faculties-notifications/${email}`;
  } else if (isStudent && email) {
    endpoint = `/student-notifications?email=${email}`;
  } else if (isAdmin) {
    endpoint = "/admin-notifications";
  }

  // Define queryKey based on role
  const queryKey = isAdmin
    ? ["notifications", "admin"]
    : ["notifications", email, userRole];
     


  // Enable condition only if correct route and params exist
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axiosInstance.get(endpoint);
      return res.data || [];
    },
    enabled: (!!email && (isFaculty || isStudent)) || isAdmin,
    staleTime: 1000 * 60 * 5,
  });

  // Update global notification context
  useEffect(() => {
    if (query.data) {
      setNotifications(query.data);
    }
  }, [query.data, setNotifications]);

  // Faculty socket listener (only for faculty)
  useEffect(() => {
    if (!email || !isFaculty) return;

    socket.emit("join-role", "faculty", email);

    const listener = async () => {
      try {
        const res = await axiosInstance.get(`/faculties-notifications/${email}`);
        setNotifications(res.data || []);
      } catch (err) {
        console.error("❌ Socket error fetching faculty notifications:", err);
      }
    };

    socket.on("faculty-notification", listener);

    return () => {
      socket.off("faculty-notification", listener);
    };
  }, [email, isFaculty, axiosInstance, setNotifications]);

  return query;
};

export default useRoleBasedNotifications;
