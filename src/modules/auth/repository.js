import mongoose from "mongoose";
import logger from "../../utils/logger.js";
import User from "./model.js";
import bcrypt from "bcrypt";

async function createUser(data) {
  try {
    const user = await User.create({ ...data });
    await mongoose.model("Profile").create({
      user: user._id,
      displayPhotoUrl:
        "https://i.pinimg.com/564x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg",
      status: "Active",
    });
    return user;
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

async function fetchUserByEmail(email) {
  try {
    return await User.findOne({ email: email });
  } catch (err) {
    logger.error(err.message);
    throw new Error(err);
  }
}

async function updatePassword(userId, data) {
  try {
    return await User.findOneAndUpdate(
      { _id: userId },
      { password: await bcrypt.hash(data.password, 10) },
    );
  } catch (err) {
    logger.error(err.message);
    throw new Error(err);
  }
}

const respository = {
  createUser,
  fetchUserByEmail,
  fetchUserById,
  updatePassword,
};

export default respository;
