import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    sender: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    recipient: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    chatRoom: {
      type: mongoose.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    content: { type: String, required: true },
    fileUrl: { type: String },
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
    chatRoom: {
      type: mongoose.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    content: { type: String, required: true },
    fileUrl: { type: String },
  },
  { timestamps: true },
);

export const Message = mongoose.model("Message", messageSchema);
export const UndeliveredMessage = mongoose.model(
  "UndeliveredMessage",
  undeliveredMessageSchema,
);
