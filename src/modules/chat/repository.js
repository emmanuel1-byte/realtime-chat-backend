import logger from "../../utils/logger.js";
import User from "../auth/model.js";
import { DirectChat } from "./model.js";

async function fetchUserById(userId) {
  try {
    return await User.findById(userId);
  } catch (err) {
    logger.error(err.message);
    throw new Error(err);
  }
}

async function fetchChat(senderId, recipient) {
  try {
    return await DirectChat.find({
      sender_id: senderId,
      recepient_id: recipient,
    }).sort(1);
  } catch (err) {
    logger.error(err.messsage);
    throw new Error(err);
  }
}

const repository = {
  fetchUserById,
  fetchChat,
};

export default repository;
