// socket.jsx (Singleton for Socket Connection)
import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    // Connected
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    // Disconnected
    socket.on("disconnect", (reason) => {
      console.warn("❌ Socket disconnected:", reason);
     
    });

    // Reconnect attempt
    socket.on("reconnect_attempt", (attempt) => {
      console.log(`🔁 Reconnect attempt #${attempt}`);
    });

    // Reconnect error
    socket.on("connect_error", (err) => {
      console.error("🚫 Socket connection error:", err.message);
    });
  }

  return socket;
};

// Optional: Reset socket if needed
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
