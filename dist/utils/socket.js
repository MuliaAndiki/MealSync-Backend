"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io = null;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: { origin: "*" },
    });
    io.on("connection", (socket) => {
        socket.on("join:restaurant", (restaurantId) => {
            if (restaurantId)
                socket.join(restaurantId);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized. Call initSocket() first.");
    }
    return io;
};
exports.getIO = getIO;
