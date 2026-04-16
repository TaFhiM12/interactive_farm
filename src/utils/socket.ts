import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export const setSocketServer = (server: SocketIOServer) => {
  io = server;
};

export const emitPlantUpdated = (payload: unknown) => {
  if (!io) {
    return;
  }

  io.emit("plant:updated", payload);
};
