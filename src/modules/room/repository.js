import logger from "../../utils/logger.js";
import User from "../auth/model.js";
import ChatRoom from "./model.js";

async function create(userId, data, roomPhoto) {
  try {
    return await ChatRoom.create({
      ...data,
      admin: userId,
      roomPhotoUrl: roomPhoto,
    });
  } catch (err) {
    logger.error(err.message);
    throw new Error(err);
  }
}

async function fetchRooms() {
  try {
    return await ChatRoom.find();
  } catch (err) {
    logger.error(err.message);
    throw new Error(err);
  }
}
async function fetchRoomById(roomId) {
  try {
    return await ChatRoom.findById(roomId);
  } catch (err) {
    logger.error(err.message);
    throw new Error(err);
  }
}

async function update(roomId, data, roomPhoto) {
  try {
    return await ChatRoom.findOneAndUpdate(
      { _id: roomId },
      { ...data, roomPhotoUrl: roomPhoto },
      { new: true },
    );
  } catch (err) {
    logger.error(err.message);
    throw new Error(err);
  }
}

async function deleteRoomById(roomId) {
  try {
    return await ChatRoom.findOneAndDelete({ _id: roomId });
  } catch (err) {
    logger.error(err.message);
    throw new Error(err);
  }
}

async function fetchUserById(userId) {
  try {
    return await User.findById(userId);
  } catch (err) {
    logger.error(err.message);
    throw new Error(err);
  }
}

const repository = {
  create,
  fetchRooms,
  fetchRoomById,
  update,
  deleteRoomById,
  fetchUserById,
};

export default repository;
