import logger from "../../utils/logger.js";
import Profile from "../profile/model.js";
import User from "./model.js";
import bcrypt from "bcrypt";

async function createUser(data) {
  let session = null;
  try {
    let session = await User.startSession();
    session.startTransaction();

    const user = new User({
      phone: data.phone,
      email: data.email,
      password: data.password,
    });
    await user.save({ session });

    const profile = new Profile({
      user_id: user._id,
      display_photo_url:
        "https://i.pinimg.com/564x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg",
      status: "Active",
    });

    await profile.save({ session });
    await session.commitTransaction();
    session.endSession();

    return user;
  } catch (err) {
    session.abortTransaction();
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
    return await User.findOneAndUpdate({
      _id: userId,
      password: await bcrypt.hash(data.password, 10),
    });
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
