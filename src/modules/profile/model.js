import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema(
  {
    user_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    fullname: { type: String },
    status: { type: String },
    display_photo_url: { type: String },
  },
  { timestamps: true },
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
