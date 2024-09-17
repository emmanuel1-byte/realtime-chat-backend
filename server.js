import express from "express";
const app = express();
const port = process.env.PORT || 7000;
import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import cors from "cors";

import initializeSocket from "./src/modules/message/socket.js";
import logger from "./src/utils/logger.js";
import respond from "./src/utils/respond.js";
import {
  globalErrorHandler,
  routeNotFoundHandler,
} from "./src/middlewares/error.js";
import connectToDatabase from "./src/utils/database.js";
import auth from "./src/modules/auth/route.js";
import profile from "./src/modules/profile/route.js";
import room from "./src/modules/room/route.js";
const server = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({ origin: "*", methods: ["POST", "GET", "PATCH", "PUT", "DELETE"] }),
);

app.get("/", (req, res) => {
  return respond(res, 200, "chat-systen-sevice is running...");
});

app.use("/api/auth", auth);
app.use("/api/profiles", profile);
app.use("/api/rooms", room);

app.use(globalErrorHandler);
app.use(routeNotFoundHandler);

server.listen(port, () => {
  connectToDatabase();
  initializeSocket(server);
  logger.info(`Server listening on port ${port}`);
});
