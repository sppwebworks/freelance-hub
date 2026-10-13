import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace("/api", "");

export const useSocket = (handlers = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => console.log("🔌 Socket connected"));
    if (handlers.onApplicationNew)
      socket.on("application:new", handlers.onApplicationNew);
    if (handlers.onApplicationStatus)
      socket.on("application:status", handlers.onApplicationStatus);
    socket.on("error", (msg) => console.error("Socket error:", msg));

    return () => socket.disconnect();
  }, []); // eslint-disable-line

  return socketRef.current;
};
