import { useCallback } from "react";
import AxiosSecure from "../AxiosSecure";

const useMarkNotificationsSeen = () => {
  const axiosInstance = AxiosSecure();

  const markSeen = useCallback(async (notifications = []) => {
    try {
      const notificationIds = notifications.map((n) => n._id);

      if (notificationIds.length > 0) {
        const res = await axiosInstance.patch("/faculty-notifications/mark-seen", {
          notificationIds, 
        });

        localStorage.setItem("hasSeen", "true");
      }
    } catch (err) {
      console.error("❌ Failed to mark notifications as seen:", err);
    }
  }, []);

  return markSeen;
};

export default useMarkNotificationsSeen;
