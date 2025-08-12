import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AxiosSecure from "../AxiosSecure";
import socket from "../useSocket";
import { useNotification } from "./NotificationProvider";

export const useFacultyNotifications = (facultyEmail, userRole) => {
  const { setNotifications } = useNotification();

  // console.log("🟢 useFacultyNotifications called with:", facultyEmail, userRole);

  const query = useQuery({
    queryKey: [facultyEmail, userRole],
    queryFn: async () => {
      // console.log("🔄 Executing queryFn for:", facultyEmail);

      const res = await AxiosSecure().get(
        `/faculties-notifications/${facultyEmail}`
      );
      // console.log("✅ Query success. Data:", res.data);
      return res.data || [];
    },
    enabled: userRole === "faculty" && !!facultyEmail,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) {
      // console.log("📥 Setting notifications in context:", query.data);
      setNotifications(query.data);
    }
  }, [query.data, setNotifications]);

  useEffect(() => {
    if (!facultyEmail) {
      console.warn("⚠️ No facultyEmail provided, skipping socket join.");
      return;
    }

    // console.log("📡 Joining socket room for faculty:", facultyEmail);
    socket.emit("join-role", "faculty", facultyEmail);

    socket.on("faculty-notification", async () => {
      // console.log("📬 Received socket notification event");

      try {
        const res = await AxiosSecure().get(
          `/faculties-notifications/${facultyEmail}` // ✅ also updated here
        );
        // console.log("📬 Updated notification data from socket:", res.data);
        setNotifications(res.data || []);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "❌ Failed to fetch updated notifications via socket:",
            err
          );
        }
      }
    });

    return () => {
      // console.log("❎ Leaving socket room for faculty:", facultyEmail);
      socket.off("faculty-notification");
    };
  }, [facultyEmail, setNotifications]);

  return query;
};
