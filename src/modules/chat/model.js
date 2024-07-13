import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    room_name: { type: String, required: true },
    description: { type: String },
    room_photo_url: { type: String },
    file_url: { type: String },
    admin: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    message: { type: String, required: true },
  },
  { timestamps: true },
);

const directChatSchema = new Schema(
  {
    sender_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    recepient_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    file_url: { type: String },
  },
  { timestamps: true },
);

const undeliveredMessageSchema = new Schema(
  {
    sender_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    recepient_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    file_url: { type: String },
  },
  { timestamps: true },
);

export const Chat = mongoose.model("Chat", chatSchema);
export const DirectChat = mongoose.model("DirectChat", directChatSchema);
export const UndeliveredMessage = mongoose.model(
  "UndeliveredMessage",
  undeliveredMessageSchema,
);
