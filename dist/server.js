"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./utils/socket");
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(app_1.default);
(0, socket_1.initSocket)(server);
(0, database_1.default)().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`http://localhost:${PORT}`);
        console.log(`Socket.IO initialized`);
    });
});
