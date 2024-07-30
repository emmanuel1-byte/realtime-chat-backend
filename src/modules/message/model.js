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

const Message = mongoose.model("Message", messageSchema);

export default Message;
