import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
const { JWT_SECRET } = process.env;
import jwt from "jsonwebtoken";
import logger from "../../utils/logger.js";
import repository from "./repository.js";
import uploadToLocalStore from "../../services/upload/localStorage.js";

function initializeSocket(server) {
  let users = {};
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // Authorization middleware
  io.use((socket, next) => {
    try {
      const accessToken = socket.handshake.auth.token.split(" ")[1];
      const decoded = jwt.verify(accessToken, JWT_SECRET);
      users[socket.id] = decoded.sub;
      next();
    } catch (err) {
      next(new Error("Validation failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("direct-message", async (message, recipientId, fileUrl) => {
      try {
        const senderId = users[socket.id];
        const previousMessages = await repository.fetchChat(
          senderId,
          recipientId,
        );
        logger.info(
          `Previous messages between ${senderId} and ${recipientId}: ${JSON.stringify(previousMessages)}`,
        );
        console.log(
          `Previous messages between ${senderId} and ${recipientId}: ${JSON.stringify(previousMessages)}`,
        );
        const user = await repository.fetchUserById(recipientId);
        if (!user) throw new Error("User does not exist");
        const recepientSocketId = Object.keys(users).find(
          (key) => users[key] === recipientId,
        );
        if (recepientSocketId) {
          socket
            .to(recepientSocketId)
            .emit("direct-message", { senderId, message });
        } else {
          //save this in an undeelivered table
        }
        await repository.createChat(senderId, recipientId, message, fileUrl);
      } catch (err) {
        logger.error(err.message);
        socket.emit("error", { messag: err.message });
      }
    });

    socket.on("chat-room-message", async (roomId, message, uploadedFile) => {
      try {
        const chat = {};
        const senderId = users[socket.id];
        //check if room exist
        const room = await "";
        if (!rooom) throw new Error("Room not found!");
        socket
          .to(room.members)
          .emit("chat-room-message", { senderId, message });
        if (fileUrl) {
          const [fileUrl] = await uploadToLocalStore(uploadedFile);
          chat[senderId];
          await repository.createChat(senderId, "members", message, fileUrl);
        }
      } catch (err) {
        logger.error(err.message);
        throw new Error(err);
      }
    });

    socket.on("join-room", (roomName) => {
      //first check if the room exist if it does then check if the user is a member or not;
      socket.join(roomName);
    });

    socket.on("leave-room", (roomName) => {
      //first check if the room exist if it does and the user is a member proceed to leave the room
      socket.leave(roomName);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}

export default initializeSocket;
