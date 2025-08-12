import { createContext, useContext, useState, useEffect } from "react";
import socket from "../useSocket";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (newNotification) => {
    if (Array.isArray(newNotification)) {
      setNotifications((prev) => [...newNotification, ...prev]);
    } else {
      setNotifications((prev) => [newNotification, ...prev]);
    }
  };

  const clearNotifications = () => setNotifications([]);

  // Optional: Listen for real-time socket notifications
  useEffect(() => {
    socket.on("faculty-notification", addNotification);
    socket.on("admin-notification", addNotification);
    socket.on("student-notification", addNotification);

    return () => {
      socket.off("faculty-notification");
      socket.off("admin-notification");
      socket.off("student-notification");
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        addNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
