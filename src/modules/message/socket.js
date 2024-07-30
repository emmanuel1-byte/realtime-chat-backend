import { Server } from "socket.io";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const { JWT_SECRET } = process.env;

function initializeSocket(server) {
  let users = {};
  const io = new Server(server, { cors: { origin: "*" } });

  //Authorization middleware
  io.use((socket, next) => {
    try {
      const accessToken = socket.handshake.auth.token?.split(" ")[1];
      if (!accessToken)
        next(socket.emit("error", { message: "Acesss token is required!" }));

      const decoded = jwt.verify(accessToken, JWT_SECRET);
      users[socket.id] = decoded.sub;
      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        next(socket.emit("error", { message: "Access token expired!" }));
      }
      next(socket.emit("error", { message: "Invalid token" }));
    }
  });

  //This function get's called if the user tries to join a room or perform any action
  async function verifyRoomAccess(socket, roomId, next) {
    try {
      const room = await mongoose.model("ChatRoom").findById(roomId);
      if (!room) {
        throw new Error("Room not found");
      }

      if (!room.members.includes(users[socket.id])) {
        throw new Error("You are not a member of this room");
      }
      socket.join(room.roomName);
      socket.room = room;

      next();
    } catch (err) {
      next(err);
    }
  }

  io.on("connection", async (socket) => {
    console.log(`${socket.id}: connected`);

    socket.on("join-room", async (roomId) => {
      verifyRoomAccess(socket, roomId, async (error) => {
        if (error) {
          socket.emit("error", { message: error.message });
          return;
        }
        const previousMessages = await mongoose
          .model("Message")
          .find({ chatRoom: roomId, createdAt: -1 });

        io.to(socket.room.roomName).emit(
          "fetch-previous-room-messages",
          previousMessages,
        );
      });
    });

    socket.on("send-room-message", async (roomId, message) => {
      verifyRoomAccess(socket, roomId, async (error) => {
        if (error) {
          socket.emit("error", { message: error.message });
          return;
        }
        const newMessage = await mongoose.model("Message").create({
          chatRoom: roomId,
          content: message,
          sender: users[socket.id],
          recipient: socket.room.members.map((user) => user),
        });

        io.to(socket.room.roomName).emit("new-room-message", newMessage);
      });

      socket.on("fetch-private-messages", async (recipientId) => {
        try {
          const user = await mongoose.model("User").findById(recipientId);
          if (!user) {
            socket.emit("error", { message: "User not found" });
            return;
          }

          const previousMessages = await mongoose.model("Message").find({
            sender: users[socket.id],
            recipient: recipientId,
          });

          io.to(users[socket.id]).emit(
            "previous-private-messages",
            previousMessages,
          );
        } catch (err) {
          socket.emit("error", { message: err.message });
        }
      });

      socket.on("send-private-message", async (recipientId, message) => {
        try {
          const user = await mongoose.model("User").findById(recipientId);
          if (!user) {
            socket.emit("error", { message: "User not found" });
            return;
          }

          const newMessage = await mongoose.model("Message").create({
            sender: users[socket.id],
            recipient: recipientId,
            content: message,
          });
          const recipientSocket = Object.keys(users).find(
            (key) => users[key] === recipientId,
          );
          io.to(users[socket.id]).emit("new-private-message", newMessage);

          if (recipientSocket) {
            io.to(recipientSocket).emit("new-private-message", newMessage);
          }
        } catch (err) {
          socket.emit("error", { message: err.message });
        }
      });
    });

    socket.on("update-private-message", async (messageId, content) => {
      try {
        const message = await mongoose
          .model("Message")
          .findByIdAndUpdate(messageId, { content: content }, { new: true });

        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        const senderSocket = Object.keys(users).find(
          (key) => users[key] === message.sender,
        );
        const recipientSocket = Object.keys(users).find(
          (key) => users[key] === message.recipient,
        );
        if (senderSocket) {
          socket.to(message.recipient).emit("message-updated", { messageId });
        }

        if (recipientSocket) {
          socket.to(message.sender).emit("message-updated", { messageId });
        }
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("update-group-message", (roomId, messageId, content) => {
      verifyRoomAccess(socket, roomId, async (error) => {
        if (error) {
          socket.emit("error", { message: err.message });
          return;
        }
        const message = await mongoose
          .model("Message")
          .findByIdAndUpdate(messageId, { content: content }, { new: true });
        if (!message) {
          socket.emit("error", { message: "Message not found" });
        }

        socket.to(socket.room.roomName).emit("message-updated", { message });
      });
    });

    socket.on("delete-private-message", async (messageId) => {
      try {
        const message = await mongoose
          .model("Message")
          .findByIdAndDelete(messageId);

        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        const senderSocket = Object.keys(users).find(
          (key) => users[key] === message.sender,
        );
        const recipientSocket = Object.keys(users).find(
          (key) => users[key] === message.recipient,
        );
        if (senderSocket) {
          socket.to(senderSocket).emit("message-deleted", { messageId });
        }

        if (recipientSocket) {
          socket.to(recipientSocket).emit("message-deleted", { messageId });
        }
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("delete-group-message", (roomId, messageId) => {
      verifyRoomAccess(socket, roomId, async (error) => {
        if (error) {
          socket.emit("error", { message: error.message });
          return;
        }
        const message = await mongoose
          .model("Message")
          .findByIdAndDelete(messageId)
          .populate("chatRoom", "roomName");
        if (!message) {
          socket.emit("error", { message: "Message not found" });
        }
        socket.to(socket.room.roomName).emit("message-deleted", { messageId });
      });
    });

    //when a client is disconnected from the server delete the user property from the users object
    socket.on("disconnect", () => {
      delete users[socket.id];
      console.log(`${socket.id}: disconnected`);
    });
  });
}

export default initializeSocket;
