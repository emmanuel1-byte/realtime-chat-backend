import mongoose, { Schema } from "mongoose";

const chatRoomSchema = new Schema(
  {
    roomName: { type: String, unique: true, required: true },
    description: { type: String },
    roomPhotoUrl: { type: String },
    admin: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    pendingApprovals: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    invites: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true },
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;
