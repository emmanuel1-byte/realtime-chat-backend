import { Message } from "./model.js";

async function createMessage(senderId, recieverId, message, fileUrl) {
  try {
    return await Message.create(senderId, recieverId, message, fileUrl);
  } catch (err) {
    logger.error(err.message);
    throw new Error(err);
  }
}

async function fetchMessage(senderId, recipient) {
  try {
    return await Message.find({
      sender: senderId,
      recepient: recipient,
    }).sort(1);
  } catch (err) {
    logger.error(err.messsage);
    throw new Error(err);
  }
}

const repository = {
  createMessage,
  fetchMessage,
};

export default repository;
