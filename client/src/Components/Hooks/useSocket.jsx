import { io } from "socket.io-client";

// 👇 Configure the socket connection
const socket = io("http://localhost:3000", {
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// 👇 Optional: Add connection logs only in DEV mode
socket.on("connect", () => {
  if (import.meta.env.DEV) {
    console.log("✅ Socket connected:", socket.id);
  }
});

socket.on("disconnect", () => {
  if (import.meta.env.DEV) {
    console.log("❌ Socket disconnected");
  }
});

export default socket;
