import Profile from "./model.js";

async function updateProfile(userId, data) {
  try {
    return await Profile.findOneAndUpdate({
      user_id: userId,
      data: {},
    });
  } catch (err) {
    throw new Error(err);
  }
}

async function fetchProfile(userId) {
  try {
    return await Profile.findOne({ user_id: userId });
  } catch (err) {
    throw new Error(err);
  }
}

async function fetchProfileById(profileId) {
  try {
    return await Profile.findById(profileId);
  } catch (err) {
    throw new Error(err);
  }
}

async function deleteAccount(userId) {}
