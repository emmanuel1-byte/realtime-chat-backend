import express from "express";
import {
  deleteAccount,
  getProfile,
  getYourProfile,
  updateProfile,
} from "./controller.js";
import validateJwt from "../../middlewares/auth.js";
import upload from "../../helpers/upload.js";
const profile = express.Router();

profile.put(
  "/",
  validateJwt,
  upload.fields([
    { name: "coverPhoto", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
  ]),
  updateProfile,
);

profile.get("/:profileId", validateJwt, getProfile);

profile.get("/", validateJwt, getYourProfile);

profile.delete("/", validateJwt, deleteAccount);

export default profile;
