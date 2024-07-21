import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String },
    status: { type: String, required: true },
    displayPhotoUrl: { type: String },
    coverPhotoUrl: { type: String },
  },
  { timestamps: true },
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
