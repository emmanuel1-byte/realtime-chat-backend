import { Server } from "socket.io";
import { verifyJwt } from "../../helpers/token.js";
import logger from "../../utils/logger.js";
import repository from "./repository.js";

function initializeSocket(server) {
  let users = {};
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // Authorization middleware
  io.use((socket, next) => {
    try {
      const accessToken = socket.handshake.auth.token;
      const { userId } = verifyJwt(accessToken);
      users[socket.id] = userId;
      next();
    } catch (err) {
      next(new Error("Validation failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("direct-message", async (message, recipientId) => {
      try {
        const senderId = users[socket.id];
        const user = await repository.fetchUserById(recipientId);
        if (!user) throw new Error("User does not exist");
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
      } catch (err) {
        logger.error(err.message);
        socket.emit("error", { messag: err.message });
      }
    });

    socket.on("chat-room-message", async (roomName, message) => {
      try {
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
