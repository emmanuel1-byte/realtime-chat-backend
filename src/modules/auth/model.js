import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    phone: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false, required: true },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  const user = this;
  try {
    if (user.isModified("password")) {
      user.password = await bcrypt.hash(user.password, 10);
      next();
    }
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
