import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app.js";
import connectDB from "./config/db.js";
import { setIO } from "./config/socket.js";
import { validateEnv } from "./config/validateEnv.js";

const PORT = process.env.PORT || 5000;

validateEnv();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
    }
    next();
  } catch {
    next(new Error("Auth failed"));
  }
});

io.on("connection", (socket) => {
  if (socket.userId) socket.join(`user:${socket.userId}`);
  socket.on("job:join", ({ jobId }) => socket.join(`job:${jobId}`));
  socket.on("job:leave", ({ jobId }) => socket.leave(`job:${jobId}`));
});

setIO(io);

(async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO ready`);
  });
})();
