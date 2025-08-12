import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import socket from "../useSocket";
import AxiosSecure from "../AxiosSecure";
import {  useNotification } from "./NotificationProvider";

export const useAdminNotifications = () => {
  const { setNotifications } = useNotification();

  const query = useQuery({
    queryKey: ["adminNotifications"],
    queryFn: async () => {
      const res = await AxiosSecure().get("/admin-notifications");
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Set context when initial query completes
  useEffect(() => {
    if (query.data) {
      setNotifications(query.data);
    }
  }, [query.data, setNotifications]);

  useEffect(() => {
    socket.emit("join-role", "admin"); // ✅ Join admin room

    // 🔁 Dynamically update context on socket event
    socket.on("admin-notification", async () => {
      try {
        const res = await AxiosSecure().get("/admin-notifications");
        setNotifications(res.data || []);
      } catch (err) {
        console.error("❌ Failed to update admin notifications dynamically", err);
      }
    });

    return () => {
      socket.off("admin-notification");
    };
  }, [setNotifications]);

  return query;
};
