import { createServer } from "http";
import { Server as SocketServer } from "socket.io";

import app from "./app.js";
import { env } from "./config/env.js";
import { setSocketServer } from "./utils/socket.js";

const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PATCH"],
  },
});

setSocketServer(io);

io.on("connection", (socket) => {
  socket.on("plant:update", (payload) => {
    io.emit("plant:updated", payload);
  });
});

httpServer.listen(env.PORT, () => {
  console.log(`Server running at http://localhost:${env.PORT}`);
});
