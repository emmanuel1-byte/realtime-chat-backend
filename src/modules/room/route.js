import express from "express";
import validateJwt from "../../middlewares/auth.js";
import {
  createChatRoom,
  deleteRoom,
  getRoom,
  listRoom,
  updateRoom,
} from "./controller.js";
import upload from "../../helpers/upload.js";
const room = express();

room.post("/", validateJwt, upload.single("roomPhoto"), createChatRoom);

room.get("/", validateJwt, listRoom);

room.get("/:roomId", validateJwt, getRoom);

room.put("/:roomId", validateJwt, updateRoom);

room.patch("/:roomId/members/:userId", validateJwt);

room.delete("/:roomId", validateJwt, deleteRoom);

export default room;
