import app from "./app";
import connectDB from "./config/database";
import http from "http";
import { initSocket } from "./utils/socket";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log(`Socket.IO initialized`);
  });
});
