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
            previousMessages
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
            (key) => users[key] === recipientId
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

    // Room join event with approval mechanism
    socket.on("request-join-room", async (roomId) => {
      const room = await mongoose.model("ChatRoom").findById(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      if (room.admin === users[socket.id]) {
        socket.emit("error", { message: "You already own this room" });
        return;
      }

      room.pendingApprovals.push(users[socket.id]);
      await room.save();

      // Notify room owner of join request
      const ownerSocket = Object.keys(users).find(
        (key) => users[key] === room.admin
      );
      if (ownerSocket) {
        io.to(ownerSocket).emit("pending-join-request", {
          userId: users[socket.id],
          roomId,
        });
      }
    });

    // Room owner approves the join request
    socket.on("approve-join-request", async (roomId, userId) => {
      const room = await mongoose.model("ChatRoom").findById(roomId);
      if (!room || room.admin !== users[socket.id]) {
        socket.emit("error", {
          message: "Only Admin can approve join requests",
        });
        return;
      }

      room.members.push(userId);
      room.pendingApprovals = room.pendingApprovals.filter(
        (member) => member !== userId
      );
      await room.save();

      // Notify approved user
      const userSocket = Object.keys(users).find(
        (key) => users[key] === userId
      );
      if (userSocket) {
        io.to(userSocket).emit("join-approved", { roomId });
      }
    });

    socket.on("update-private-message", async (messageId, content) => {
      try {
        // Find the message by its ID
        const message = await mongoose.model("Message").findById(messageId);

        // Check if the message exists
        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        // Check if the sender of the message is the current user
        if (message.sender !== users[socket.id]) {
          socket.emit("error", {
            message: "You are not authorized to update this message",
          });
          return;
        }

        // Update the message content
        message.content = content;
        await message.save();

        // Emit an event to the sender to confirm the update
        socket.emit("message-updated", { messageId, content });

        // Notify the recipient about the updated message
        const recipientSocket = Object.keys(users).find(
          (key) => users[key] === message.recipient
        );
        if (recipientSocket) {
          io.to(recipientSocket).emit("message-updated", {
            messageId,
            content,
          });
        }
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("delete-private-message", async (messageId) => {
      try {
        // Find the message by its ID
        const message = await mongoose.model("Message").findById(messageId);

        // Check if the message exists
        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        // Check if the sender of the message is the current user
        if (message.sender !== users[socket.id]) {
          socket.emit("error", {
            message: "You are not authorized to delete this message",
          });
          return;
        }

        // Delete the message
        await mongoose.model("Message").findByIdAndDelete(messageId);

        // Emit a message-deleted event to the sender
        socket.emit("message-deleted", { messageId });

        // Optionally, notify the recipient that the message was deleted (if needed)
        const recipientSocket = Object.keys(users).find(
          (key) => users[key] === message.recipient
        );
        if (recipientSocket) {
          io.to(recipientSocket).emit("message-deleted", { messageId });
        }
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // Update Group Message with sender or admin check
    socket.on("update-group-message", async (roomId, messageId, content) => {
      verifyRoomAccess(socket, roomId, async (error) => {
        if (error) {
          socket.emit("error", { message: error.message });
          return;
        }

        const message = await mongoose.model("Message").findById(messageId);
        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        const room = await mongoose.model("ChatRoom").findById(roomId);

        // Allow only the sender or the room owner (admin) to update
        if (
          message.sender !== users[socket.id] &&
          room.admin !== users[socket.id]
        ) {
          socket.emit("error", { message: "Unauthorized action" });
          return;
        }

        message.content = content;
        await message.save();

        socket.to(socket.room.roomName).emit("message-updated", { message });
      });
    });

    // Delete Group Message with sender or admin check
    socket.on("delete-group-message", async (roomId, messageId) => {
      verifyRoomAccess(socket, roomId, async (error) => {
        if (error) {
          socket.emit("error", { message: error.message });
          return;
        }

        const message = await mongoose.model("Message").findById(messageId);
        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        const room = await mongoose.model("ChatRoom").findById(roomId);

        // Allow only the sender or the room owner (admin) to delete
        if (
          message.sender !== users[socket.id] &&
          room.admin !== users[socket.id]
        ) {
          socket.emit("error", { message: "Unauthorized action" });
          return;
        }

        await mongoose.model("Message").findByIdAndDelete(messageId);
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
