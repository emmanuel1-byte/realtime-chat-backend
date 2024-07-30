import mongoose from "mongoose";
import logger from "../../utils/logger.js";
import Profile from "./model.js";

async function updateProfile(userId, data, pofilePhotoUrl, coverPhotoUrl) {
  try {
    return await Profile.findOneAndUpdate(
      { user: userId },
      { ...data, pofilePhotoUrl, coverPhotoUrl },
      { new: true },
    );
  } catch (err) {
    logger.error(err.stack);
    throw new Error(err);
  }
}

async function fetchProfile(userId) {
  try {
    return await Profile.findOne({ user: userId }).populate(
      "user",
      "email phone",
    );
  } catch (err) {
    logger.error(err.stack);
    throw new Error(err);
  }
}

async function fetchProfileById(profileId) {
  try {
    return await Profile.findById(profileId);
  } catch (err) {
    logger.error(err.stack);
    throw new Error(err);
  }
}

async function deleteUserById(userId) {
  try {
    await mongoose.model("User").deleteOne({ _id: userId });
    await mongoose.model("Profile").deleteOne({ user: userId });
  } catch (err) {
    logger.error(err.stack);
    throw new Error(err);
  }
}

const repository = {
  updateProfile,
  fetchProfile,
  fetchProfileById,
  deleteUserById,
};

export default repository;
