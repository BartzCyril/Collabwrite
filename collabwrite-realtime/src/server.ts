import cors from "cors";
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Socket, Server as SocketIOServer } from "socket.io";
import { setupSocketHandlers } from "./sockets/messageHandlers.js";
import {
  handleWebRTCDisconnect,
  setupWebRTCHandlers,
} from "./sockets/webrtcHandlers.js";

const app = express();
const httpServer = createServer(app);

// Configuration Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Middleware Express
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "CollabWrite Realtime Server is running" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
  });
});

// Configuration des gestionnaires Socket.IO
setupSocketHandlers(io);

// Configuration des gestionnaires WebRTC pour l'audio
setupWebRTCHandlers(io);

io.on("connection", (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${socket.id} (${reason})`);
    handleWebRTCDisconnect(socket);
  });

  socket.on("error", (error) => {
    console.error(`Socket error ${socket.id}:`, error);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`CollabWrite Realtime Server running on port ${PORT}`);
  console.log(
    `CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
});

process.on("SIGTERM", () => {
  console.log(
    `[${new Date().toISOString()}] SIGTERM signal received: closing HTTP server`
  );
  httpServer.close(() => {
    console.log(`[${new Date().toISOString()}] HTTP server closed`);
  });
});

export { io };
