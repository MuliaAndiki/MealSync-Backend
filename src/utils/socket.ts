import { Server } from "socket.io";
import http from "http";
import type { Server as HttpServer } from "http";

let io: Server | null = null;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("join:restaurant", (restaurantId: string) => {
      if (restaurantId) socket.join(restaurantId);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized. Call initSocket() first."
    );
  }
  return io;
};
