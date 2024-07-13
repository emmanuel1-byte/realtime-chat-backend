import express from "express";
const app = express();
const port = process.env.PORT || 3000;
import { createServer } from "node:http";

import initializeSocket from "./src/modules/chat/socket.js";
import logger from "./src/utils/logger.js";
import respond from "./src/utils/respond.js";
import {
  globalErrorHandler,
  routeNotFoundHandler,
} from "./src/middlewares/error.js";
import connectToDatabase from "./src/utils/database.js";
import auth from "./src/modules/auth/route.js";
const server = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return respond(res, 200, "chat-systen-sevice is running...");
});

app.use("/api/auth", auth);

app.use(globalErrorHandler);
app.use(routeNotFoundHandler);

server.listen(port, () => {
  connectToDatabase();
  initializeSocket(server);
  logger.info(`Server listening on port ${port}`);
});
